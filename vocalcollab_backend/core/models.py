from django.db import models
from django.core.exceptions import ValidationError
from PIL import Image
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField
from cloudinary.models import CloudinaryField

# Create your models here.

# Track model
class Track(models.Model):
    title = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    audio_file = models.URLField(blank=True, null=True)  
    tags = models.CharField(help_text="Please use comma to separate")
    created_time = models.DateTimeField(auto_now_add=True)
    cover_image = models.URLField(blank=True, null=True)  #change to url
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tracks')

    def __str__(self):
        return self.title
    
# Comment model
class Comment (models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

# Like model
class Like (models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='like')
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('track', 'user')

class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.username} → {self.following.username}"