import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { UserProfile } from '../types';

interface UsersListProps {
  users: UserProfile[];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  userLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  listingInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  listingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  listingCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  awardBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FBBF24',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  awardText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});

const UserRow: React.FC<{ user: UserProfile }> = ({ user }) => {
  return (
    <TouchableOpacity style={styles.userRow} activeOpacity={0.7}>
      <View style={styles.userLeftContent}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.avatarImage}
          />
        </View>

        {/* Info */}
        <View style={styles.userInfo}>
          <Text style={styles.username} numberOfLines={1}>
            {user.username}
          </Text>
          <View style={styles.listingInfo}>
            <Text style={styles.listingLabel}>E'lonlar</Text>
            <Text style={styles.listingCount}>{user.listingCount}</Text>
          </View>
        </View>
      </View>

      {/* Award Badge */}
      <View style={styles.awardBadge}>
        <Text style={styles.awardText}>★</Text>
      </View>
    </TouchableOpacity>
  );
};

const UsersList: React.FC<UsersListProps> = ({ users }) => {
  if (users.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Natijalar topilmadi</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <UserRow user={item} />}
      keyExtractor={(item) => item.id}
      style={styles.container}
      scrollEnabled={true}
    />
  );
};

export default UsersList;
