package com.umni.note_service.service;

import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileValidationService {

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;

    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "png", "image/png",
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg",
            "webp", "image/webp",
            "pdf", "application/pdf",
            "txt", "text/plain",
            "doc", "application/msword",
            "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    public ValidatedFile validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("A non-empty file is required");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size must not exceed 10 MB");
        }

        String fileName = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        if (fileName.isBlank() || fileName.contains("..") || fileName.contains("/")
                || fileName.contains("\\")) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String extension = StringUtils.getFilenameExtension(fileName);
        extension = extension == null ? "" : extension.toLowerCase(Locale.ROOT);
        String expectedType = ALLOWED_TYPES.get(extension);
        if (expectedType == null) {
            throw new IllegalArgumentException("Unsupported file type");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (Exception e) {
            throw new IllegalArgumentException("Could not read uploaded file", e);
        }

        if (!hasValidSignature(extension, bytes)) {
            throw new IllegalArgumentException("File content does not match its extension");
        }

        return new ValidatedFile(fileName, expectedType);
    }

    private boolean hasValidSignature(String extension, byte[] bytes) {
        return switch (extension) {
            case "png" -> startsWith(bytes, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
            case "jpg", "jpeg" -> startsWith(bytes, 0xFF, 0xD8, 0xFF);
            case "webp" -> bytes.length >= 12
                    && startsWith(bytes, 0x52, 0x49, 0x46, 0x46)
                    && bytes[8] == 0x57 && bytes[9] == 0x45
                    && bytes[10] == 0x42 && bytes[11] == 0x50;
            case "pdf" -> startsWith(bytes, 0x25, 0x50, 0x44, 0x46, 0x2D);
            case "doc" -> startsWith(bytes, 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1);
            case "docx" -> startsWith(bytes, 0x50, 0x4B, 0x03, 0x04);
            case "txt" -> isValidUtf8Text(bytes);
            default -> false;
        };
    }

    private boolean startsWith(byte[] bytes, int... signature) {
        if (bytes.length < signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if ((bytes[i] & 0xFF) != signature[i]) {
                return false;
            }
        }
        return true;
    }

    private boolean isValidUtf8Text(byte[] bytes) {
        for (byte value : bytes) {
            if (value == 0) {
                return false;
            }
        }
        try {
            StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(bytes));
            return true;
        } catch (CharacterCodingException e) {
            return false;
        }
    }

    public record ValidatedFile(String fileName, String contentType) {
    }
}
