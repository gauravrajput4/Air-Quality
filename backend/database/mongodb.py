from __future__ import annotations

import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.errors import PyMongoError

_MEMORY_DATABASE: Dict[str, List[Dict[str, Any]]] = {
    "predictions": [],
    "campuses": [],
    "air_quality_data": [],
    "users": [],
}


class MongoConnection:
    _database = None

    @classmethod
    def get_database(cls):
        if cls._database is not None:
            return cls._database

        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        db_name = os.getenv("MONGODB_DB", "campus_air_quality")

        try:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=1200)
            client.server_info()
            cls._database = client[db_name]
        except PyMongoError:
            cls._database = None
        return cls._database


def _serialize_document(document: Dict[str, Any]) -> Dict[str, Any]:
    serialized = dict(document)
    if "_id" in serialized:
        serialized["id"] = str(serialized.pop("_id"))
    if "campus_id" in serialized and isinstance(serialized["campus_id"], ObjectId):
        serialized["campus_id"] = str(serialized["campus_id"])
    return serialized


class PredictionRepository:
    def __init__(self) -> None:
        self._memory_store = _MEMORY_DATABASE["predictions"]
        database = MongoConnection.get_database()
        self._collection: Optional[Collection] = database["predictions"] if database is not None else None

    def add_prediction(self, record: Dict[str, Any]) -> None:
        safe_record = dict(record)
        if self._collection is not None:
            self._collection.insert_one(safe_record)
            return
        self._memory_store.append(safe_record)

    def get_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        if self._collection is not None:
            docs = list(self._collection.find({}, {"_id": 0}).sort("created_at", -1).limit(limit))
            return docs
        return list(reversed(self._memory_store[-limit:]))


class CampusRepository:
    def __init__(self) -> None:
        self._memory_store = _MEMORY_DATABASE["campuses"]
        database = MongoConnection.get_database()
        self._collection: Optional[Collection] = database["campuses"] if database is not None else None

    def add_campus(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        record = {
            "name": payload["name"],
            "location": payload["location"],
            "latitude": payload["latitude"],
            "longitude": payload["longitude"],
            "created_at": payload.get("created_at", datetime.utcnow()),
        }

        if self._collection is not None:
            inserted_id = self._collection.insert_one(record).inserted_id
            record["_id"] = inserted_id
            return _serialize_document(record)

        record["id"] = str(len(self._memory_store) + 1)
        self._memory_store.append(record)
        return dict(record)

    def list_campuses(self) -> List[Dict[str, Any]]:
        if self._collection is not None:
            docs = list(self._collection.find({}).sort("created_at", 1))
            return [_serialize_document(doc) for doc in docs]
        return [dict(item) for item in self._memory_store]

    def get_campus(self, campus_id: str) -> Optional[Dict[str, Any]]:
        if self._collection is not None:
            try:
                document = self._collection.find_one({"_id": ObjectId(campus_id)})
            except Exception:
                return None
            return _serialize_document(document) if document else None
        return next((dict(item) for item in self._memory_store if item.get("id") == campus_id), None)


class AirQualityRepository:
    def __init__(self) -> None:
        self._memory_store = _MEMORY_DATABASE["air_quality_data"]
        database = MongoConnection.get_database()
        self._collection: Optional[Collection] = database["air_quality_data"] if database is not None else None

    def add_record(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        record = dict(payload)
        if self._collection is not None:
            if record.get("campus_id"):
                record["campus_id"] = ObjectId(record["campus_id"])
            inserted_id = self._collection.insert_one(record).inserted_id
            record["_id"] = inserted_id
            return _serialize_document(record)

        record["id"] = str(len(self._memory_store) + 1)
        self._memory_store.append(record)
        return dict(record)

    def get_latest_by_campus(self, campus_id: str) -> Optional[Dict[str, Any]]:
        if self._collection is not None:
            try:
                document = self._collection.find_one({"campus_id": ObjectId(campus_id)}, sort=[("timestamp", -1)])
            except Exception:
                return None
            return _serialize_document(document) if document else None

        records = [item for item in self._memory_store if item.get("campus_id") == campus_id]
        return dict(sorted(records, key=lambda item: item.get("timestamp", datetime.min), reverse=True)[0]) if records else None

    def get_history_for_campus(self, campus_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        if self._collection is not None:
            try:
                docs = list(
                    self._collection.find({"campus_id": ObjectId(campus_id)}).sort("timestamp", -1).limit(limit)
                )
            except Exception:
                return []
            return [_serialize_document(doc) for doc in docs]

        records = [dict(item) for item in self._memory_store if item.get("campus_id") == campus_id]
        return sorted(records, key=lambda item: item.get("timestamp", datetime.min), reverse=True)[:limit]


class UserRepository:
    def __init__(self) -> None:
        self._memory_store = _MEMORY_DATABASE["users"]
        database = MongoConnection.get_database()
        self._collection: Optional[Collection] = database["users"] if database is not None else None

    def add_user(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        record = dict(payload)
        if self._collection is not None:
            inserted_id = self._collection.insert_one(record).inserted_id
            record["_id"] = inserted_id
            return _serialize_document(record)

        record["id"] = str(len(self._memory_store) + 1)
        self._memory_store.append(record)
        return dict(record)

    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        if self._collection is not None:
            document = self._collection.find_one({"username": username})
            return _serialize_document(document) if document else None
        return next((dict(item) for item in self._memory_store if item.get("username") == username), None)

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self._collection is not None:
            try:
                document = self._collection.find_one({"_id": ObjectId(user_id)})
            except Exception:
                return None
            return _serialize_document(document) if document else None
        return next((dict(item) for item in self._memory_store if item.get("id") == user_id), None)

    def list_users(self) -> List[Dict[str, Any]]:
        if self._collection is not None:
            docs = list(self._collection.find({}).sort("created_at", -1))
            return [_serialize_document(doc) for doc in docs]
        return list(reversed([dict(item) for item in self._memory_store]))
