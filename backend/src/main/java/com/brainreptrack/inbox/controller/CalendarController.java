package com.brainreptrack.inbox.controller;

import com.brainreptrack.inbox.dto.CalendarEventDto;
import com.brainreptrack.inbox.domain.InboxItem;
import com.brainreptrack.inbox.repository.InboxItemRepository;
import com.brainreptrack.shared.response.ApiResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Exposes calendar events extracted from inbox items.
 *
 * <p>GET /api/calendar/events — returns all inbox items that contain a
 * detected calendar event (calendar_event JSON is not null and type=DATE_EVENT).</p>
 */
@Slf4j
@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final InboxItemRepository inboxItemRepository;
    private final ObjectMapper objectMapper;

    /**
     * Returns all inbox items that have a detected calendar event.
     */
    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<CalendarEventDto>>> getEvents() {
        List<InboxItem> all = inboxItemRepository.findAll();
        List<CalendarEventDto> events = new ArrayList<>();

        for (InboxItem item : all) {
            String calJson = item.getCalendarEvent();
            if (calJson == null || calJson.isBlank()) continue;

            try {
                Map<String, Object> cal = objectMapper.readValue(
                        calJson, new TypeReference<Map<String, Object>>() {});

                String type = String.valueOf(cal.getOrDefault("type", "NONE"));
                if (!"DATE_EVENT".equals(type)) continue;

                CalendarEventDto dto = CalendarEventDto.builder()
                        .inboxItemId(item.getId())
                        .rawText(item.getRawText())
                        .type(type)
                        .date(toString(cal.get("date")))
                        .time(toString(cal.get("time")))
                        .title(toString(cal.get("title")))
                        .description(toString(cal.get("description")))
                        .createdAt(item.getCreatedAt() != null ? item.getCreatedAt().toString() : null)
                        .build();

                events.add(dto);
            } catch (Exception e) {
                log.warn("[Calendar] Could not parse calendar_event for InboxItem {}: {}",
                        item.getId(), e.getMessage());
            }
        }

        log.info("[Calendar] Returning {} calendar events", events.size());
        return ResponseEntity.ok(ApiResponse.ok(events));
    }

    private String toString(Object value) {
        if (value == null) return null;
        String s = value.toString().trim();
        return (s.isEmpty() || "null".equalsIgnoreCase(s)) ? null : s;
    }
}
