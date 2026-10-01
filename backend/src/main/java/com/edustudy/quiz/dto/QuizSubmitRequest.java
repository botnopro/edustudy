package com.edustudy.quiz.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSubmitRequest {

    // Flexible deserializer to support both Map<Long, String> {"1": "A"} 
    // and Array of objects [{"questionId": 1, "selectedAnswer": "A"}]
    // and complex objects like True/False 4 sub-options or Essay text/images
    @JsonDeserialize(using = FlexibleAnswersDeserializer.class)
    private Map<Long, String> answers;

    private Integer timeSpentSeconds;

    public static class FlexibleAnswersDeserializer extends JsonDeserializer<Map<Long, String>> {
        @Override
        public Map<Long, String> deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            JsonNode node = p.getCodec().readTree(p);
            Map<Long, String> result = new HashMap<>();
            if (node == null || node.isNull()) {
                return result;
            }

            if (node.isObject()) {
                Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> entry = fields.next();
                    try {
                        Long qId = Long.parseLong(entry.getKey());
                        String ans = entry.getValue().isTextual() ? entry.getValue().asText() : entry.getValue().toString();
                        result.put(qId, ans);
                    } catch (NumberFormatException ignored) {}
                }
            } else if (node.isArray()) {
                for (JsonNode item : node) {
                    if (item.has("questionId") && item.has("selectedAnswer")) {
                        long qId = item.get("questionId").asLong();
                        JsonNode ansNode = item.get("selectedAnswer");
                        String ans = ansNode.isTextual() ? ansNode.asText() : ansNode.toString();
                        result.put(qId, ans);
                    }
                }
            }

            return result;
        }
    }
}
