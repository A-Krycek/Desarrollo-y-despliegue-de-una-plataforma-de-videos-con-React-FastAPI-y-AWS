import React from 'react';
import { Film, Plus } from 'lucide-react';
import { Button, Alert } from '../atoms';
import { UserProfileCard } from '../molecules';
import { UserVideoList, EditVideoModal } from '../organisms';

export const ProfileTemplate = ({
  user,
  userVideos = [],
  loading = false,
  error = null,
  notification = null,
  videoToEdit = null,
  isEditModalOpen = false,
  deletingId = null,
  onSelectVideo,
  onEditVideo,
  onDeleteVideo,
  onCloseEditModal,
  onUpdateSuccess,
  onOpenUpload,
}) => {
  return (
    <div className="profile-page-container">
<UserProfileCard user={user} />
<Alert type="success" message={notification} />
      <Alert type="error" message={error} />
<div className="profile-videos-section">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <Film size={22} className="section-icon" />
            <h2>Mis Videos Subidos ({userVideos.length})</h2>
          </div>
          <Button
            variant="hero"
            onClick={onOpenUpload}
            icon={Plus}
          >
            Nuevo Video
          </Button>
        </div>
<UserVideoList
          videos={userVideos}
          loading={loading}
          onSelectVideo={onSelectVideo}
          onEditVideo={onEditVideo}
          onDeleteVideo={onDeleteVideo}
          deletingId={deletingId}
          onOpenUpload={onOpenUpload}
        />
      </div>
<EditVideoModal
        video={videoToEdit}
        isOpen={isEditModalOpen}
        onClose={onCloseEditModal}
        onUpdateSuccess={onUpdateSuccess}
      />
    </div>
  );
};
