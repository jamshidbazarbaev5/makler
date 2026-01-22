import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants';

const tabs = [
  { id: 'listings', icon: 'home-outline', activeIcon: 'home' },
  { id: 'deals', icon: 'hand-left-outline', activeIcon: 'hand-left' },
  { id: 'favorites', icon: 'heart-outline', activeIcon: 'heart' },
];

const filters = [
  ['Status', 'Saralash'],
  ["E'lon maqsadi", 'Mulk toifasi'],
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('listings');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.username}>jamshid_b</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="share-outline" size={20} color={COLORS.gray700} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="pencil-outline" size={20} color={COLORS.gray700} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="menu-outline" size={20} color={COLORS.gray700} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatarGradient}>
                  <Text style={styles.avatarText}>JH</Text>
                </View>
                {/* Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>0</Text>
                    <Text style={styles.statLabel}>E'lonlar</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>0</Text>
                    <Text style={styles.statLabel}>Ko'rishlar</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>0</Text>
                    <Text style={styles.statLabel}>Qo'ng'iroqlar</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.name}>Jams hid</Text>
            </View>

            {/* Balance Section */}
            <View style={styles.balanceSection}>
              <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Balans </Text>
                <Text style={styles.balanceValue}>0 UZS</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>To'ldirish</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Paket</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    style={[
                      styles.tabButton,
                      isActive && styles.activeTab,
                    ]}
                  >
                    <Ionicons
                      name={isActive ? tab.activeIcon : tab.icon}
                      size={24}
                      color={isActive ? COLORS.primary : COLORS.gray500}
                    />
                    {isActive && (
                      <View style={styles.activeTabIndicator} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            {filters.map((row, i) => (
              <View key={i} style={styles.filterRow}>
                {row.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={styles.filterChip}
                  >
                    <Text style={styles.filterText}>{filter}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Empty State */}
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="home-outline" size={40} color={COLORS.accent} />
              <View style={[styles.dot, styles.dotTopRight]} />
              <View style={[styles.dot, styles.dotBottomLeft]} />
              <View style={[styles.dot, styles.dotTopLeft]} />
            </View>
          </View>
        </View>
      </ScrollView>
      {/*<BottomNav />*/}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  profileSection: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    paddingHorizontal: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginTop: 12,
  },
  balanceSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  balanceCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    color: COLORS.gray500,
    fontSize: 14,
  },
  balanceValue: {
    fontWeight: '600',
    color: COLORS.gray900,
    fontSize: 16,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.purpleDark,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tabButton: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.purple,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    width: '100%',
    height: 2,
    backgroundColor: COLORS.purple,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterChip: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filterText: {
    color: COLORS.gray700,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.purpleLight,
  },
  dotTopRight: {
    top: -4,
    right: -4,
  },
  dotBottomLeft: {
    bottom: -8,
    left: -8,
  },
  dotTopLeft: {
    top: 0,
    left: -16,
  },
});
