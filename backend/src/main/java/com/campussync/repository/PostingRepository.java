package com.campussync.repository;

import com.campussync.model.Posting;
import com.campussync.model.enums.Gender;
import com.campussync.model.enums.PostingStatus;
import com.campussync.model.enums.SharingType;
import com.campussync.model.enums.TenantPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PostingRepository extends JpaRepository<Posting, Long> {

    /**
     * Server-side discovery query (FR-3, FR-4, FR-5).
     * Strict gender rule: you share the room with the provider, so a seeker only ever
     * sees listings whose PROVIDER is the same gender. PG type / sharing / location are
     * optional sub-filters (null = ignore).
     */
    @Query("""
            SELECT p FROM Posting p
            JOIN FETCH p.postedBy 
            LEFT JOIN FETCH p.imageUrls 
            WHERE p.status = :status
              AND p.postedBy.gender = :gender
              AND p.postedBy.id != :userId
              AND (:sharingType IS NULL OR p.sharingType = :sharingType)
              AND (:cityPrefix IS NULL OR p.officeCampus LIKE CONCAT(:cityPrefix, '%'))
              AND (:officeCampus IS NULL OR p.officeCampus = :officeCampus)
              AND (:tenantPreference IS NULL OR p.tenantPreference = :tenantPreference)
            ORDER BY p.createdAt DESC
            """)
    List<Posting> search(@Param("status") PostingStatus status,
                         @Param("gender") Gender gender,
                         @Param("userId") Long userId,
                         @Param("sharingType") SharingType sharingType,
                         @Param("cityPrefix") String cityPrefix,
                         @Param("officeCampus") String officeCampus,
                         @Param("tenantPreference") TenantPreference tenantPreference);

    /** Listings owned by a given provider. */
   @Query("SELECT p FROM Posting p JOIN FETCH p.postedBy LEFT JOIN FETCH p.imageUrls WHERE p.postedBy.id = :userId ORDER BY p.createdAt DESC")
    List<Posting> findByPostedByIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    /** Distinct office locations used to populate the filter dropdown. */
    @Query("SELECT DISTINCT p.officeCampus FROM Posting p WHERE p.status = com.campussync.model.enums.PostingStatus.AVAILABLE ORDER BY p.officeCampus")
    List<String> findDistinctOfficeCampuses();

    /** Duplicate-listing guard: same provider, same PG name + campus, still active. */
    boolean existsByPostedByIdAndPgNameIgnoreCaseAndOfficeCampusIgnoreCaseAndStatus(
            Long userId, String pgName, String officeCampus, PostingStatus status);

    /** Active listings whose reconfirm window has opened but the reminder hasn't been sent. */
    @Query("SELECT p FROM Posting p JOIN FETCH p.postedBy WHERE p.status = :status AND p.reminderSent = false AND p.createdAt < :reminderCutoff")
    List<Posting> findByStatusAndReminderSentFalseAndCreatedAtBefore(@Param("status") PostingStatus status, @Param("reminderCutoff") LocalDateTime reminderCutoff);

    /** Active listings past their expiry that were never re-confirmed. */
   @Query("SELECT p FROM Posting p JOIN FETCH p.postedBy WHERE p.status = :status AND p.expiresAt < :time")
    List<Posting> findByStatusAndExpiresAtBefore(@Param("status") PostingStatus status, @Param("time") LocalDateTime time);

    // 1. Override the default findAll to prevent N+1 on the basic main feed
    @Query("SELECT DISTINCT p FROM Posting p JOIN FETCH p.postedBy LEFT JOIN FETCH p.imageUrls ORDER BY p.createdAt DESC")
    List<Posting> findAll();

    // 2. Override the default findById to prevent N+1 when viewing a single post
    @Query("SELECT p FROM Posting p JOIN FETCH p.postedBy LEFT JOIN FETCH p.imageUrls WHERE p.id = :id")
    Optional<Posting> findById(@Param("id") Long id);
    }