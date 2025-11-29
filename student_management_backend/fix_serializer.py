import sys

# Read the file
with open('api/serializers.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add validators = [] to MarkSerializer Meta class
old_text = """        read_only_fields = ['id', 'percentage', 'created_at', 'updated_at']

class AssignmentSerializer"""

new_text = """        read_only_fields = ['id', 'percentage', 'created_at', 'updated_at']
        # Disable unique_together validation to allow custom create method to handle it
        validators = []

class AssignmentSerializer"""

if old_text in content:
    content = content.replace(old_text, new_text)
    with open('api/serializers.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully added validators = [] to MarkSerializer")
else:
    print("Could not find the text to replace")
    sys.exit(1)
