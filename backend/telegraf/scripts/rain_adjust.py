#!/usr/bin/env python3
import sys
import re

# Set manual overrides here
CORRECTIONS = {
    "rain_d": 0,
    "rain_w": 0,
    "rain_m": 0,
}

# Regex 
FIELD_REGEX = re.compile(r"(\S+)=(\S+)")

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue

    try:
        # Line Protocol is: <measurement>,<tag_set> <field_set> <timestamp>
        parts = line.split(" ", 2)
        if len(parts) < 3:
            
            print(line)
            continue

        measurement_tags = parts[0]
        fields_raw = parts[1]
        timestamp = parts[2]

        corrected_fields = []

        # Iterate over all fields in the field set
        for field_pair in fields_raw.split(','):
            match = field_pair.split('=', 1)
            if len(match) == 2:
                key, value_str = match

                if key in CORRECTIONS:
                    try:
                        old_value = float(value_str)

                        # Round to the first decimal place and apply any correction
                        corrected_value = round(old_value + CORRECTIONS.get(key, 0), 1)

                        print(f"[OK] {key}: {old_value} → {corrected_value}", file=sys.stderr)

                        # use Line Protocol
                        corrected_fields.append(f"{key}={corrected_value}")

                    except ValueError:
                        corrected_fields.append(field_pair)
                else:
                    corrected_fields.append(field_pair)
            else:
                corrected_fields.append(field_pair)

        
        new_fields_raw = ",".join(corrected_fields)
        if new_fields_raw:
            print(f"{measurement_tags} {new_fields_raw} {timestamp}")

        sys.stdout.flush()

    except Exception as e:
        # If there is an error, print the error and move on with the original data
        print(f"[EXCEPTION] Errore su riga: {line}", file=sys.stderr)
        print(f"[EXCEPTION] {e}", file=sys.stderr)
        print(line)
        sys.stdout.flush()
