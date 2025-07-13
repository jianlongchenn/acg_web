from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from .models import Track, Like, Comment, Follow
from rest_framework.response import Response
from .serializers import TrackSerializer
from .serializers import CommentSerializer
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly


# Create your views here.
class TrackListCreateView(generics.ListCreateAPIView):
    queryset = Track.objects.all().order_by('-created_time')
    serializer_class = TrackSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

class TrackDetailView(generics.RetrieveAPIView):
    queryset = Track.objects.all()
    serializer_class = TrackSerializer

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        track_id = self.kwargs['pk']
        return Comment.objects.filter(track_id=track_id).order_by('-created_at')

    def perform_create(self, serializer):
        track = Track.objects.get(pk=self.kwargs['pk'])
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(track=track, user=user)
        

class LikeCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        track = get_object_or_404(Track, pk=pk)
        user = request.user

        if Like.objects.filter(track=track, user=user).exists():
            return Response({"detail": "You already liked this track."}, status=400)

        Like.objects.create(track=track, user=user)
        return Response({"detail": "Liked successfully."}, status=201)
    
class RegisterSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserTrackListView(generics.ListAPIView):
    serializer_class = TrackSerializer

    def get_queryset(self):
        username = self.kwargs['username']
        return Track.objects.filter(user__username=username).order_by('-created_time')
    
# views.py

class FollowToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        target_user = get_object_or_404(User, username=username)
        current_user = request.user

        if target_user == current_user:
            return Response({'detail': "You can't follow yourself."}, status=400)

        follow_relation, created = Follow.objects.get_or_create(
            follower=current_user,
            following=target_user
        )

        if not created:
            follow_relation.delete()
            return Response({'detail': 'Unfollowed successfully.'})
        else:
            return Response({'detail': 'Followed successfully.'})

class ToggleFollowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        target_user = get_object_or_404(User, username=username)
        current_user = request.user

        if target_user == current_user:
            return Response({'detail': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        follow, created = Follow.objects.get_or_create(follower=current_user, following=target_user)
        if not created:
            follow.delete()
            return Response({'detail': 'Unfollowed successfully.'}, status=status.HTTP_200_OK)
        return Response({'detail': 'Followed successfully.'}, status=status.HTTP_201_CREATED)

class IsFollowingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        target_user = get_object_or_404(User, username=username)
        is_following = Follow.objects.filter(follower=request.user, following=target_user).exists()
        return Response({'is_following': is_following})

class FollowerListView(generics.ListAPIView):
    serializer_class = RegisterSerializer  

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_object_or_404(User, username=username)
        return User.objects.filter(following__following=user)

class FollowingListView(generics.ListAPIView):
    serializer_class = RegisterSerializer

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_object_or_404(User, username=username)
        return User.objects.filter(followers__follower=user)
    
class CommentDeleteView(generics.DestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
