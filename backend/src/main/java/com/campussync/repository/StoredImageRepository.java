package com.campussync.repository;

import com.campussync.model.StoredImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoredImageRepository extends JpaRepository<StoredImage, Long> {
}
