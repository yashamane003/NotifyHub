package com.notifyhub.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private long totalSent;
    private long totalFailed;
    private long scheduledCount;
    private long templatesCount;
}
