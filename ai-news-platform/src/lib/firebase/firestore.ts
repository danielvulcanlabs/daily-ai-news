import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import type { UserProfile } from '@/types/user';
import type { UserConnector, ConnectorProvider } from '@/types/connector';
import type { Topic, TopicUpdate, CreateTopicInput } from '@/types/topic';
import type { Digest } from '@/types/digest';

// ── Helpers ──

function toDate(ts: Timestamp | Date | null): Date | null {
  if (!ts) return null;
  if (ts instanceof Timestamp) return ts.toDate();
  return ts;
}

// ── Users ──

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    ...data,
    createdAt: toDate(data.createdAt) ?? new Date(),
    updatedAt: toDate(data.updatedAt) ?? new Date(),
  } as UserProfile;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ── Connectors ──

export async function getUserConnectors(uid: string): Promise<UserConnector[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'connectors'));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    tokenExpiresAt: toDate(d.data().tokenExpiresAt),
    lastSyncAt: toDate(d.data().lastSyncAt),
    connectedAt: toDate(d.data().connectedAt) ?? new Date(),
  })) as UserConnector[];
}

export async function upsertConnector(uid: string, connector: Partial<UserConnector> & { provider: ConnectorProvider }) {
  const connectorRef = doc(db, 'users', uid, 'connectors', connector.provider);
  await setDoc(connectorRef, {
    ...connector,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function removeConnector(uid: string, provider: ConnectorProvider) {
  await deleteDoc(doc(db, 'users', uid, 'connectors', provider));
}

// ── Topics ──

export async function getUserTopics(uid: string): Promise<Topic[]> {
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'topics'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: toDate(d.data().createdAt) ?? new Date(),
    updatedAt: toDate(d.data().updatedAt) ?? new Date(),
  })) as Topic[];
}

export async function createTopic(uid: string, input: CreateTopicInput): Promise<string> {
  const topicRef = doc(collection(db, 'users', uid, 'topics'));
  await setDoc(topicRef, {
    ...input,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return topicRef.id;
}

export async function updateTopic(uid: string, topicId: string, data: Partial<Topic>) {
  await updateDoc(doc(db, 'users', uid, 'topics', topicId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTopic(uid: string, topicId: string) {
  await deleteDoc(doc(db, 'users', uid, 'topics', topicId));
}

export async function getTopicUpdates(
  uid: string,
  topicId: string,
  max: number = 50
): Promise<TopicUpdate[]> {
  const snap = await getDocs(
    query(
      collection(db, 'users', uid, 'topics', topicId, 'updates'),
      orderBy('fetchedAt', 'desc'),
      limit(max)
    )
  );
  return snap.docs.map((d) => ({
    id: d.id,
    topicId,
    ...d.data(),
    fetchedAt: toDate(d.data().fetchedAt) ?? new Date(),
    readAt: toDate(d.data().readAt),
  })) as TopicUpdate[];
}

// ── Digests ──

export async function getDigest(uid: string, date: string): Promise<Digest | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'digests', date));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: date,
    ...data,
    generatedAt: toDate(data.generatedAt) ?? new Date(),
    updatedAt: toDate(data.updatedAt) ?? new Date(),
  } as Digest;
}

export async function saveDigest(uid: string, date: string, digest: Partial<Digest>) {
  await setDoc(doc(db, 'users', uid, 'digests', date), {
    ...digest,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getRecentDigests(uid: string, max: number = 30): Promise<Digest[]> {
  const snap = await getDocs(
    query(
      collection(db, 'users', uid, 'digests'),
      orderBy('generatedAt', 'desc'),
      limit(max)
    )
  );
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    generatedAt: toDate(d.data().generatedAt) ?? new Date(),
    updatedAt: toDate(d.data().updatedAt) ?? new Date(),
  })) as Digest[];
}
