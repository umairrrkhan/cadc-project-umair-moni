package com.umni.note_service.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class FileValidationServiceTests {

    private final FileValidationService service = new FileValidationService();

    @Test
    void acceptsPngContentWithPngExtension() {
        byte[] png = new byte[] {
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00
        };
        MockMultipartFile file = new MockMultipartFile(
                "file", "problem.png", "application/octet-stream", png);

        FileValidationService.ValidatedFile result = service.validate(file);

        assertEquals("problem.png", result.fileName());
        assertEquals("image/png", result.contentType());
    }

    @Test
    void rejectsSpoofedExtension() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "malware.pdf", "application/pdf", "not a pdf".getBytes());

        assertThrows(IllegalArgumentException.class, () -> service.validate(file));
    }
}
