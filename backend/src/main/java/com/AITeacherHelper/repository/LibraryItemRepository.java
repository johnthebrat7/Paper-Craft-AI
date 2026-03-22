package com.AITeacherHelper.repository;

import com.AITeacherHelper.model.LibraryItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LibraryItemRepository extends MongoRepository<LibraryItem, String> {
    List<LibraryItem> findByTeacherEmailOrderBySavedAtDesc(String teacherEmail);
}
