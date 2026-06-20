package com.campussync.repository;

import com.campussync.model.Doubt;
import com.campussync.model.enums.DoubtCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoubtRepository extends JpaRepository<Doubt, Long> {
    @Query("SELECT d FROM Doubt d JOIN FETCH d.askedBy ORDER BY d.createdAt DESC")
    List<Doubt> findAllByOrderByCreatedAtDesc();
    @Query("SELECT d FROM Doubt d JOIN FETCH d.askedBy WHERE d.category = :category ORDER BY d.createdAt DESC")
    List<Doubt> findByCategoryOrderByCreatedAtDesc(@Param("category") DoubtCategory category);;
    List<Doubt> findByAskedById(Long userId);
}