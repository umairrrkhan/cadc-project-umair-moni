package com.umni.note_service.service;



import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;



@Service
public class S3StorageService {

	
	private final S3Client s3Client;
	private final String bucketName;
	
	public S3StorageService(
            @Value("${aws.s3.bucket}") String bucketName,
            @Value("${aws.s3.region}") String region,
            @Value("${aws.s3.access-key}") String accessKey,
            @Value("${aws.s3.secret-key}") String secretKey) {
        this.bucketName = bucketName;
        this.s3Client = S3Client.builder()
    .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
         .build();
    }
	
	public String getBucketName() {
        return bucketName;
    }
	
	public String uploadFile(byte[] fileData, String key , String contentType) {
		PutObjectRequest request = PutObjectRequest.builder()
				.bucket(bucketName)
				.key(key)
				.contentType(contentType)
				.build();
		
		s3Client.putObject(request , RequestBody.fromBytes(fileData));
		return String.format("https://%s.s3.amazonaws.com/%s", bucketName, key);
	}
	
	public void deleteFile(String key) {
		s3Client.deleteObject(builder -> builder.bucket(bucketName).key(key));
	}
}


