const allowedCategories = [
  'Technology',
  'Business',
  'Education',
  'Health',
  'Lifestyle',
  'Travel',
  'Food',
  'Sports',
  'Entertainment',
  'Finance',
  'Science',
  'Other'
];

export function validatePosts(
  title: unknown,
  content: unknown,
  category: unknown,
  tags: unknown
) {
  if (
    typeof category !== 'string' ||
    !allowedCategories.includes(category)
  ) {
    return 'Invalid category';
  }

  if (
    typeof title !== 'string' ||
    title.trim() === ''
  ) {
    return 'Title must be non-empty string';
  }

  if (
    typeof content !== 'string' ||
    content.trim() === ''
  ) {
    return 'Content must be non-empty string';
  }

}