import test from 'ava';
import * as dotenv from 'dotenv';
dotenv.config();
import * as wrtc from 'wrtc';
import { FirePeer } from '../firepeer';
import firebase from './firebase.fixture';
import { vars, waitConn, waitEvent } from './utils';

test.before(async t => {
  await firebase
    .auth()
    .signInWithEmailAndPassword(vars.BOB_EMAIL, vars.BOB_PASS);
});

test.after(async t => {
  await firebase.app().delete();
});

test('bob waits for connection from alice authenticated', async t => {
  const bob = new FirePeer(firebase, {
    id: 'bob1',
    spOpts: { wrtc }
  });

  const peer = await waitConn(bob);
  t.is(peer.initiatorId, 'alice1');
  t.is(peer.initiatorUid, vars.ALICE_UID);
  t.is(peer.receiverId, 'bob1');
  t.is(peer.receiverUid, vars.BOB_UID);
  t.pass();
});

test('bob waits for connection from alice authenticated - allow', async t => {
  const bob = new FirePeer(firebase, {
    id: 'bob2',
    onOffer: signal => {
      t.is(signal.uid, vars.ALICE_UID);
      return signal;
    },
    spOpts: { wrtc }
  });

  const peer = await waitConn(bob);
  t.is(peer.initiatorId, 'alice2');
  t.is(peer.initiatorUid, vars.ALICE_UID);
  t.is(peer.receiverId, 'bob2');
  t.is(peer.receiverUid, vars.BOB_UID);
  t.pass();
});

test('bob waits for connection from alice authenticated - deny', async t => {
  const bob = new FirePeer(firebase, {
    id: 'bob3',
    onOffer: signal => null,
    spOpts: { wrtc }
  });

  await waitEvent(bob, 'connection_failed');
  t.pass();
});
