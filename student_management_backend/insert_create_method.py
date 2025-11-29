import sys

# Read the file
with open('api/views.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with "permission_classes = [AllowAny]" in MarkViewSet
insert_index = None
for i, line in enumerate(lines):
    if i > 265 and 'permission_classes = [AllowAny]' in line and 'MarkViewSet' in ''.join(lines[max(0, i-5):i]):
        insert_index = i + 1
        break

if insert_index is None:
    print("Could not find insertion point")
    sys.exit(1)

# Create the new method
new_method = '''    
    def create(self, request, *args, **kwargs):
        """Override create to use update_or_create for handling duplicate marks"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Extract the unique fields
        student_id = serializer.validated_data.get('student').id
        subject = serializer.validated_data.get('subject')
        exam_type = serializer.validated_data.get('exam_type')
        teacher_id = serializer.validated_data.get('teacher').id
        
        # Use update_or_create to handle duplicates
        mark, created = Mark.objects.update_or_create(
            student_id=student_id,
            subject=subject,
            exam_type=exam_type,
            teacher_id=teacher_id,
            defaults={
                'marks_obtained': serializer.validated_data.get('marks_obtained'),
                'total_marks': serializer.validated_data.get('total_marks'),
                'remarks': serializer.validated_data.get('remarks', ''),
                'class_name': serializer.validated_data.get('class_name'),
                'division': serializer.validated_data.get('division'),
            }
        )
        
        # Return the created/updated mark
        output_serializer = self.get_serializer(mark)
        headers = self.get_success_headers(output_serializer.data)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(output_serializer.data, status=status_code, headers=headers)
'''

# Insert the method
new_lines = lines[:insert_index] + [new_method] + lines[insert_index:]

# Write back
with open('api/views.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Successfully inserted create method at line {insert_index}")
