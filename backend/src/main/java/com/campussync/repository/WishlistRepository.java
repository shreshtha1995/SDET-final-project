package com.campussync.repository;

import com.campussync.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Query;
    import org.springframework.data.repository.query.Param;
import java.util.List;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    

    @Query("""
        SELECT w FROM Wishlist w 
        JOIN FETCH w.posting p 
        JOIN FETCH p.postedBy 
        LEFT JOIN FETCH p.imageUrls 
        WHERE w.user.id = :userId 
        ORDER BY w.createdAt DESC
    """)
    List<Wishlist> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);


    boolean existsByUserIdAndPostingId(Long userId, Long postingId);

    void deleteByUserIdAndPostingId(Long userId, Long postingId);

    void deleteByPostingId(Long postingId);

    void deleteByUserId(Long userId);

    /** Posting ids this user has wishlisted (for heart state on the client). */
    @Query("SELECT w.posting.id FROM Wishlist w WHERE w.user.id = :userId")
    List<Long> findPostingIdsByUserId(Long userId);
}
