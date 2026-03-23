package com.AITeacherHelper.repository;

import com.AITeacherHelper.model.JobTracker;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobTrackerRepository extends MongoRepository<JobTracker, String> {
    Optional<JobTracker> findFirstByAssignmentId(String assignmentId);
}
