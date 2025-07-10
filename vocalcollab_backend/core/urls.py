from django.urls import path
from .views import TrackListCreateView, TrackDetailView, LikeCreateView, CommentListCreateView, RegisterView, FollowToggleView, ToggleFollowView, IsFollowingView, FollowerListView, FollowingListView
from .views import UserTrackListView

urlpatterns = [
    path('tracks/', TrackListCreateView.as_view(), name='track-list-create'),
    path('tracks/<int:pk>/', TrackDetailView.as_view(), name='track-detail-create'),
    path('tracks/<int:pk>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('tracks/<int:pk>/like/', LikeCreateView.as_view(), name='like-track'),

    path('register/', RegisterView.as_view(), name='register'),

    path('users/<str:username>/tracks/', UserTrackListView.as_view(), name='user-track-list'),
    path('users/<str:username>/follow/', ToggleFollowView.as_view(), name='toggle-follow'),
    path('users/<str:username>/is_following/', IsFollowingView.as_view(), name='is-following'),
    path('users/<str:username>/followers/', FollowerListView.as_view(), name='follower-list'),
    path('users/<str:username>/following/', FollowingListView.as_view(), name='following-list'),
]