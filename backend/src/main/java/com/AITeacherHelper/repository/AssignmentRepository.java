package com.AITeacherHelper.repository;

import com.AITeacherHelper.model.Assignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends MongoRepository<Assignment, String> {
    List<Assignment> findByTeacherIdOrderByCreatedAtDesc(String teacherId);
}
