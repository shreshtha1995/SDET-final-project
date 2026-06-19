package com.campussync.service.storage;

import com.campussync.exception.ApiException;
import io.imagekit.client.ImageKitClient;
import io.imagekit.client.okhttp.ImageKitOkHttpClient;
import io.imagekit.models.files.FileUploadParams;
import io.imagekit.models.files.FileUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "imagekit")
public class ImageKitImageStorage implements ImageStorage {

    private final ImageKitClient imageKitClient;

    // V3 SDK only requires the Private Key for backend uploads!
    public ImageKitImageStorage(@Value("${imagekit.private-key}") String privateKey) {
        
        this.imageKitClient = ImageKitOkHttpClient.builder()
                .privateKey(privateKey)
                .build();
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
            byte[] fileBytes = file.getBytes();

            FileUploadParams params = FileUploadParams.builder()
                    .file(fileBytes)
                    .fileName(safeFileName(file.getOriginalFilename()))
                    .folder("/campussync-uploads")
                    .build();

            FileUploadResponse response = imageKitClient.files().upload(params);

            // V3 SDK wraps the URL in an Optional, so we extract it safely here
            return response.url().orElseThrow(() -> 
                ApiException.badRequest("ImageKit failed to return a URL")
            );

        } catch (IOException e) {
            throw ApiException.badRequest("Failed to process image: " + e.getMessage());
        } catch (Exception e) {
            throw ApiException.badRequest("Failed to upload image to ImageKit: " + e.getMessage());
        }
    }

    private String safeFileName(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return UUID.randomUUID().toString() + ".jpg";
        }
        return UUID.randomUUID().toString() + "-" + originalFilename.replaceAll("[\\\\/]+", "_").trim();
    }
}