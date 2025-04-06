#!/bin/bash

echo "Checking for AirPlay devices..."

# Run dns-sd for a limited time and capture output
output=$(timeout 2 dns-sd -B _airplay._tcp local 2>/dev/null)

# Filter lines containing '_airplay._tcp'
filtered_lines=$(echo "$output" | grep -i "_airplay._tcp")

# Extract device names (last column) while handling multi-word names
device_names=$(echo "$filtered_lines" | awk '{for(i=7;i<=NF;i++) printf $i " "; print ""}' | sed 's/ $//')

# Remove duplicates and exclude the host device name (e.g., 'MacBook Pro')
unique_device_names=$(echo "$device_names" | sort | uniq | grep -v "MacBook Pro")

# Check if any valid devices are detected
if [[ -n "$unique_device_names" ]]; then
    echo "true"  # AirPlay devices detected
else
    echo "false"  # No AirPlay devices detected
fi
