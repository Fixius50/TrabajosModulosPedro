-- Add new columns for enhanced monitoring
alter table sm_metrics 
add column if not exists disk_usage_gb text, -- "Used / Total"
add column if not exists net_rx_mb text, -- Download speed or total
add column if not exists net_tx_mb text, -- Upload speed or total
add column if not exists uptime text; -- System uptime

-- Notify agent to restart if needed (Optional, just comment)
