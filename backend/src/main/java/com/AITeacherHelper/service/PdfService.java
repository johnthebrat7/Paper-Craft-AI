package com.AITeacherHelper.service;

import com.AITeacherHelper.model.Assignment;
import com.AITeacherHelper.model.embedded.Question;
import com.AITeacherHelper.model.embedded.Section;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class PdfService {

    public byte[] generateAssignmentPdf(Assignment assignment) throws IOException {
        Document document = new Document(PageSize.A4, 50, 50, 60, 60);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Header
            Font boldLarge = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font boldMed = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normal = FontFactory.getFont(FontFactory.HELVETICA, 11);
            Font italic = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10);
            Font small = FontFactory.getFont(FontFactory.HELVETICA, 10);

            Paragraph school = new Paragraph(assignment.getSchoolName() != null ? assignment.getSchoolName() : "", boldLarge);
            school.setAlignment(Element.ALIGN_CENTER);
            document.add(school);

            Paragraph subjectClass = new Paragraph(
                    "Subject: " + assignment.getSubject() + "     Class: " + assignment.getStandardClass(), boldMed);
            subjectClass.setAlignment(Element.ALIGN_CENTER);
            subjectClass.setSpacingAfter(4);
            document.add(subjectClass);

            // Time + Marks row
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(10);
            PdfPCell timeCell = new PdfPCell(new Paragraph("Time Allowed: " + assignment.getTimeAllowed(), small));
            timeCell.setBorder(Rectangle.NO_BORDER);
            PdfPCell marksCell = new PdfPCell(new Paragraph("Maximum Marks: " + assignment.getTotalMarks(), small));
            marksCell.setBorder(Rectangle.NO_BORDER);
            marksCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            metaTable.addCell(timeCell);
            metaTable.addCell(marksCell);
            document.add(metaTable);

            // Separator line
            Chunk line = new Chunk(new com.lowagie.text.pdf.draw.LineSeparator());
            document.add(new Paragraph(line));

            // Student info
            Paragraph studentInfo = new Paragraph();
            studentInfo.add(new Chunk("Name: ________________________     ", normal));
            studentInfo.add(new Chunk("Roll Number: ____________     ", normal));
            studentInfo.add(new Chunk("Section: ________", normal));
            studentInfo.setSpacingBefore(10);
            studentInfo.setSpacingAfter(15);
            document.add(studentInfo);

            // Title
            Paragraph title = new Paragraph(assignment.getTitle(), boldMed);
            title.setSpacingAfter(10);
            document.add(title);

            // Sections
            if (assignment.getSections() != null) {
                for (Section section : assignment.getSections()) {
                    Paragraph secHeader = new Paragraph(section.getTitle(), boldMed);
                    secHeader.setSpacingBefore(12);
                    secHeader.setSpacingAfter(4);
                    document.add(secHeader);

                    if (section.getInstruction() != null) {
                        Paragraph instr = new Paragraph(section.getInstruction(), italic);
                        instr.setSpacingAfter(8);
                        document.add(instr);
                    }

                    int qNum = 1;
                    for (Question question : section.getQuestions()) {
                        PdfPTable qTable = new PdfPTable(2);
                        qTable.setWidthPercentage(100);
                        qTable.setWidths(new float[]{88, 12});
                        qTable.setSpacingAfter(6);

                        String diffTag = question.getDifficulty() != null ? " [" + question.getDifficulty().name() + "]" : "";
                        PdfPCell qCell = new PdfPCell(new Paragraph(qNum + ". " + question.getQuestionText() + diffTag, normal));
                        qCell.setBorder(Rectangle.NO_BORDER);
                        qCell.setPaddingBottom(4);

                        PdfPCell mCell = new PdfPCell(new Paragraph("[" + question.getMarks() + "M]", small));
                        mCell.setBorder(Rectangle.NO_BORDER);
                        mCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                        mCell.setPaddingBottom(4);

                        qTable.addCell(qCell);
                        qTable.addCell(mCell);
                        document.add(qTable);
                        qNum++;
                    }
                }
            }

            document.add(new Paragraph(line));
            Paragraph end = new Paragraph("*** END OF QUESTION PAPER ***", italic);
            end.setAlignment(Element.ALIGN_CENTER);
            end.setSpacingBefore(8);
            document.add(end);

            document.close();
        } catch (DocumentException e) {
            throw new IOException("Error generating PDF: " + e.getMessage(), e);
        }
        return out.toByteArray();
    }
}
