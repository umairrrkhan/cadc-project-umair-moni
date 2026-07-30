package com.umni.vision.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.Instant;

@Service

public class S3StorageService {
	private final S3Client s3Client;
	private final String bucketName;
	public S3StorageService(@Value("${aws.s3.bucket}") String bucketName,
            @Value("${aws.s3.region}") String region,
            @Value("${aws.s3.access-key}") String accessKey,
            @Value("${aws.s3.secret-key}") String secretKey) {
		this.bucketName  = bucketName;
		this.s3Client = S3Client.builder()
				.region(Region.of(region))
				.credentialsProvider(StaticCredentialsProvider.create(
						AwsBasicCredentials.create(accessKey, secretKey)
						))
				.build();
	}
	
	public String uploadImage(byte[] imageData , String userId , String type) {
		String key = String.format("vision/%s/%s_%s.png", 
	            userId, 
	            type, 
	            Instant.now().toEpochMilli());
		
		
		PutObjectRequest request = PutObjectRequest.builder()
				.bucket(bucketName)
				.key(key)
				.contentType("image/png")
				.build();
		
		s3Client.putObject(request , RequestBody.fromBytes(imageData));
		
		return String.format("https://%s.s3.amazonaws.com/%s" ,bucketName, key);
		
		
	};
	
	
	public void deleteImage(String key) {
        s3Client.deleteObject(builder -> builder.bucket(bucketName).key(key));
    }

	public void deleteImageByUrl(String imageUrl) {
		if (imageUrl == null || imageUrl.isBlank()) {
			return;
		}
		String prefix = String.format("https://%s.s3.amazonaws.com/", bucketName);
		if (!imageUrl.startsWith(prefix)) {
			throw new IllegalArgumentException("Image URL does not belong to the configured bucket");
		}
		deleteImage(imageUrl.substring(prefix.length()));
	}
	
	

}
