"""Base CRUD operations."""

from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import Base

ModelType = TypeVar("ModelType", bound=BaseModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """Base class for CRUD operations.
    
    Attributes:
        model: The SQLAlchemy model class
    """

    def __init__(self, model: Type[ModelType]):
        """Initialize CRUD object with SQLAlchemy model.
        
        Args:
            model: The SQLAlchemy model class
        """
        self.model = model

    def get_all(self, db: Session) -> List[ModelType]:
        return db.query(self.model).all()

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        """Get a record by ID.
        
        Args:
            db: Database session
            id: Record ID
            
        Returns:
            Optional[ModelType]: Found record or None
        """
        return db.query(self.model).filter(self.model.id == id).first()

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        """Create a new record.
        
        Args:
            db: Database session
            obj_in: Create schema with record data
            
        Returns:
            ModelType: Created record
        """
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        """Update a record.
        
        Args:
            db: Database session
            db_obj: Existing record to update
            obj_in: Update data
            
        Returns:
            ModelType: Updated record
        """
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> ModelType:
        """Remove a record.
        
        Args:
            db: Database session
            id: Record ID
            
        Returns:
            ModelType: Removed record
        """
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj

    def get_by_field(
        self, db: Session, field_name: str, value: Any
    ) -> Optional[ModelType]:
        """Get a record by a specific field value.
        
        Args:
            db: Database session
            field_name: Name of the field to filter by
            value: Value to filter for
            
        Returns:
            Optional[ModelType]: Found record or None
        """
        return db.query(self.model).filter(
            getattr(self.model, field_name) == value
        ).first()

    def get_multi_by_field(
        self,
        db: Session,
        field_name: str,
        value: Any,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[ModelType]:
        """Get multiple records by a specific field value.
        
        Args:
            db: Database session
            field_name: Name of the field to filter by
            value: Value to filter for
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List[ModelType]: List of found records
        """
        return db.query(self.model).filter(
            getattr(self.model, field_name) == value
        ).offset(skip).limit(limit).all()
