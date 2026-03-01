package com.brainreptrack.inbox.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Represents a calendar event extracted from an inbox item by the AI.
 * Mirrors the JSON format described in the date-extraction prompt.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CalendarEventDto {

    /** Original inbox item ID. */
    private UUID inboxItemId;

    /** Raw text of the inbox item (used as context in the UI). */
    private String rawText;

    /** Always "DATE_EVENT" when an event was detected, "NONE" otherwise. */
    private String type;

    /** Event date in ISO-8601 format (YYYY-MM-DD), or null when type=NONE. */
    private String date;

    /** Event time in 24-h format (HH:MM), or null when not specified. */
    private String time;

    /** Short, clear event title, or null when type=NONE. */
    private String title;

    /** Brief description of the event, or null when type=NONE. */
    private String description;

    /** ISO-8601 timestamp when the inbox item was created. */
    private String createdAt;
}
