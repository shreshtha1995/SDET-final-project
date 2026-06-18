package com.campussync.controller;

import com.campussync.exception.ApiException;
import com.campussync.repository.StoredImageRepository;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final StoredImageRepository storedImageRepository;

    public ImageController(StoredImageRepository storedImageRepository) {
        this.storedImageRepository = storedImageRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        var image = storedImageRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Image not found."));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .contentLength(image.getSizeBytes())
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .body(image.getImageData());
    }
}
