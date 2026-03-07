import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final databaseServiceProvider = Provider<DatabaseService>((ref) {
  throw UnimplementedError('DatabaseService must be overridden in main.dart');
});

abstract class DatabaseService {
  Future<void> setDocument({
    required String collection,
    required String docId,
    required Map<String, dynamic> data,
    bool merge = true,
  });

  Future<Map<String, dynamic>?> getDocument({
    required String collection,
    required String docId,
  });

  Future<void> deleteDocument({
    required String collection,
    required String docId,
  });
}

class FirestoreDatabaseService implements DatabaseService {
  FirestoreDatabaseService(this._firestore);

  final FirebaseFirestore _firestore;

  @override
  Future<void> setDocument({
    required String collection,
    required String docId,
    required Map<String, dynamic> data,
    bool merge = true,
  }) async {
    await _firestore
        .collection(collection)
        .doc(docId)
        .set(data, SetOptions(merge: merge));
  }

  @override
  Future<Map<String, dynamic>?> getDocument({
    required String collection,
    required String docId,
  }) async {
    final doc = await _firestore.collection(collection).doc(docId).get();
    return doc.data();
  }

  @override
  Future<void> deleteDocument({
    required String collection,
    required String docId,
  }) async {
    await _firestore.collection(collection).doc(docId).delete();
  }
}

class MockDatabaseService implements DatabaseService {
  final Map<String, Map<String, Map<String, dynamic>>> _store = {};

  @override
  Future<void> setDocument({
    required String collection,
    required String docId,
    required Map<String, dynamic> data,
    bool merge = true,
  }) async {
    final collectionMap = _store.putIfAbsent(collection, () => {});
    if (!merge || !collectionMap.containsKey(docId)) {
      collectionMap[docId] = Map<String, dynamic>.from(data);
      return;
    }
    collectionMap[docId] = {
      ...collectionMap[docId]!,
      ...data,
    };
  }

  @override
  Future<Map<String, dynamic>?> getDocument({
    required String collection,
    required String docId,
  }) async {
    final collectionMap = _store[collection];
    if (collectionMap == null) return null;
    final doc = collectionMap[docId];
    return doc == null ? null : Map<String, dynamic>.from(doc);
  }

  @override
  Future<void> deleteDocument({
    required String collection,
    required String docId,
  }) async {
    final collectionMap = _store[collection];
    collectionMap?.remove(docId);
  }
}
