from rest_framework import serializers
from .models import Track
from .models import Comment
from .models import Like
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Follow
from django.contrib.auth.models import User

class TrackSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    cover_image = serializers.URLField(required=False, allow_null=True)
    audio_file = serializers.URLField(required=True)

    class Meta:
        model = Track
        fields = '__all__'
        read_only_fields = ['id', 'created_time', 'user']

        
class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'track', 'created_at']
        read_only_fields = ['id', 'user', 'track', 'created_at']

class LikeSerializer (serializers.ModelSerializer):
    class Meta:
        model = Like 
        fields = '__all__'

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username
        return token

class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class FollowSerializer(serializers.ModelSerializer):
    follower = UserBriefSerializer(read_only=True)
    following = UserBriefSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']
        read_only_fields = ['id', 'follower', 'created_at']
