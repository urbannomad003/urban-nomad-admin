import { Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { Observable, defer } from 'rxjs';
import { AppUser } from '../../../models/users';

@Injectable({
  providedIn: 'root',
})
export class UsersListService {
  private readonly firestore = inject(Firestore);
  private readonly envInjector = inject(EnvironmentInjector);

  getUsersLive(): Observable<AppUser[]> {
    return defer(() =>
      runInInjectionContext(this.envInjector, () => {
        return new Observable<AppUser[]>((subscriber) => {
          const usersRef = collection(this.firestore, 'users');

          const unsubscribe = onSnapshot(
            usersRef,
            (snapshot) => {
              const items: AppUser[] = snapshot.docs.map((docSnap) => ({
                uid: docSnap.id,
                ...(docSnap.data() as Omit<AppUser, 'uid'>),
              }));
              subscriber.next(items);
            },
            (error) => {
              subscriber.error(error);
            },
          );

          return () => unsubscribe();
        });
      }),
    );
  }
}