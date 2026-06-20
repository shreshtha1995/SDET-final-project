package com.campussync.repository;

import com.campussync.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    @Query("SELECT a FROM Answer a JOIN FETCH a.answeredBy WHERE a.doubt.id = :doubtId ORDER BY a.createdAt ASC")
    List<Answer> findByDoubtIdOrderByCreatedAtAsc(@Param("doubtId") Long doubtId);
    long countByDoubtId(Long doubtId);
    List<Answer> findByAnsweredById(Long userId);
}
