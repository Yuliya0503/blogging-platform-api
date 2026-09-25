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
  if (!category) {
    return 'Category is required'
  } else if (
    typeof category !== 'string' ||
    !allowedCategories.includes(category)
  ) {
    return 'Invalid category';
  }

  if (!title) {
    return 'Title is required'
  } else  if (
    typeof title !== 'string' ||
    title.trim() === ''
    ) {
      return 'Title must be non-empty string';
  } else if (title.trim().length > 255) {
    return 'Title must not exceed 255 characters.'
  }


  if (!content) {
    return 'Content is required'
  } else  if (
    typeof content !== 'string' ||
    content.trim() === ''
  ) {
    return 'Content must be non-empty string';
  }

  if (tags !== undefined) {
    if (
      !Array.isArray(tags) ||
      !tags.every(
        (tag) => typeof tag === 'string' && tag.trim() !== ''
      )
    ) {
      return 'Tags must be an array of non-empty strings';
    } 
    if (tags.some((tag) => tag.trim().length > 20)) {
      return 'Each tag must not exceed 20 characters.'
    }
  }
  

  return null;
}