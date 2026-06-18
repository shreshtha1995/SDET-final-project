package com.campussync.service.storage;

import com.campussync.exception.ApiException;
import com.campussync.model.StoredImage;
import com.campussync.repository.StoredImageRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "database")
public class DatabaseImageStorage implements ImageStorage {

    private final StoredImageRepository storedImageRepository;

    public DatabaseImageStorage(StoredImageRepository storedImageRepository) {
        this.storedImageRepository = storedImageRepository;
    }

    @Override
    public List<String> storeAll(MultipartFile[] files) {
        List<String> urls = new ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                urls.add(store(file));
            }
        }
        return urls;
    }

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("No image file provided.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw ApiException.badRequest("Only image files are allowed.");
        }

        try {
            StoredImage image = StoredImage.builder()
                    .fileName(safeFileName(file.getOriginalFilename()))
                    .contentType(contentType)
                    .sizeBytes(file.getSize())
                    .imageData(file.getBytes())
                    .build();
            StoredImage saved = storedImageRepository.save(image);
            return "/api/images/" + saved.getId();
        } catch (IOException e) {
            throw ApiException.badRequest("Failed to read image: " + e.getMessage());
        }
    }

    private String safeFileName(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "upload";
        }
        return originalFilename.replaceAll("[\\\\/]+", "_").trim();
    }
}
