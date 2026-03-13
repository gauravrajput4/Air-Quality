from __future__ import annotations

import os
from typing import Any, Dict, List

from pymongo import MongoClient
from pymongo.errors import PyMongoError


class PredictionRepository:
    def __init__(self) -> None:
        self._memory_store: List[Dict[str, Any]] = []
        self._collection = None
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        db_name = os.getenv("MONGODB_DB", "campus_air_quality")

        try:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=1200)
            client.server_info()
            self._collection = client[db_name]["predictions"]
        except PyMongoError:
            self._collection = None

    def add_prediction(self, record: Dict[str, Any]) -> None:
        if self._collection is not None:
            self._collection.insert_one(record)
            return
        self._memory_store.append(record)

    def get_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        if self._collection is not None:
            docs = list(self._collection.find({}, {"_id": 0}).sort("created_at", -1).limit(limit))
            return docs
        return list(reversed(self._memory_store[-limit:]))
