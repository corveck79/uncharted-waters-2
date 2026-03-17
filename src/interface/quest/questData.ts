import {
  buyItem,
  exitBuildingIfNotLodge,
  receiveGold,
  receiveFirstShip,
  assignFirstRoles,
  recruitRocco,
  recruitEnrico,
  recruitMatthew,
  receiveOttoShip,
  recruitEmilio,
  receiveCatalinaShip,
  recruitHans,
  receiveErnstShip,
  recruitCamillo,
  receivePietroShip,
  recruitSalim,
  receiveAliShip,
} from '../../state/actionsPort';
import { asInferredKeysWithValue } from '../../utils';

export const messagePositions = [0, 1, 2] as const;
export type MessagePosition = typeof messagePositions[number];

export type Message = VendorMessage | CharacterMessage;

export type VendorMessage = {
  position: Extract<MessagePosition, 0>;
} & MessageCommon;

export type CharacterMessage = {
  characterId: string;
  position: Extract<MessagePosition, 1 | 2>;
} & MessageCommon;

type MessageCommon = {
  body: string;
  action?: () => void;
  completeQuest?: true;
  exitBuilding?: true;
  confirm?: {
    yes: () => void;
    no: () => void;
  };
  fadeBeforeNext?: true;
};

const questData = asInferredKeysWithValue<Message[]>()({
  houseBeforeQuest: [
    {
      body: 'Father, did you send for me?',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Ah, $firstName, I’ve been wanting to ask you a few questions.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'First, has your fencing improved?',
      characterId: '19',
      position: 1,
    },
    {
      body: 'Yes, compared to before. But I think I’d be lucky to get just one point out of five if I were fighting you, Father.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'And have you studied your sailing lessons?',
      characterId: '19',
      position: 1,
    },
    {
      body: 'Well, I finished my studies at school. But I can’t think of anything more useless than an education without practical experience. ',
      characterId: '1',
      position: 2,
    },
    {
      body: 'I see. Well then, have you mastered geography?',
      characterId: '19',
      position: 1,
    },
    {
      body: 'Well, since I’ve never been allowed to leave Lisbon, I only know what I’ve learned in books.',
      characterId: '1',
      position: 2,
    },
    {
      body: '$firstName, don’t knock textbooks. The advice of others can prove to be invaluable.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'Yes sir.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Remember that, $firstName. And finally, how’s that lute coming along?',
      characterId: '19',
      position: 1,
    },
    {
      body: 'It’s just a hobby, Father. I’m not really good enough to play for audiences.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Really? Your mother has mentioned that you have a fairly good reputation with her friends.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'You must be kidding.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Ha, ha, ha. I’ll have to have you play for me sometime.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'Anyway $firstName, to get down to business...',
      characterId: '19',
      position: 1,
    },
    {
      body: 'Yes sir?',
      characterId: '1',
      position: 2,
    },
    {
      body: 'I have something very important to tell you today.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'What is it, Father?',
      characterId: '1',
      position: 2,
    },
    {
      body: 'As you already know, when I was your age, I was already out on the open seas, fighting pirates and scoundrels.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'I have heard the tales. (Here he goes again!)',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Up until now, I have forbidden you to leave this harbor, due to your youth and inexperience.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'However, the $lastName men cannot live on land forever.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'You already have enough knowledge. What you need now is experience.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'I want you to search for adventure, to live a life on the edge, like I did.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'Yes sir!',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Along with that I have an important task for you: Go and find the secret of Atlantis.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'The secret of Atlantis? What do you mean?',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Well, that’s something you’ll have to discover on your own, son!',
      characterId: '19',
      position: 1,
    },
    {
      body: 'It’s a difficult task, and there may be hardships along the way, but it’s urgent that you find it.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'Furthermore, I’ve ordered the townspeople to treat you like a commoner from now on, so prepare yourself for that as well.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'Your ship is being built even now. You’ll be leaving soon, so you’d better get ready at once. Good luck son, make me proud!',
      characterId: '19',
      position: 1,
    },
    {
      body: 'Rocco! Rocco! Where are you?!',
      characterId: '19',
      position: 1,
    },
    {
      body: 'Ahoy, sir, I’m right here.',
      characterId: '32',
      position: 2,
    },
    {
      body: 'I’m leaving you in charge of his education. Teach him how to be a true sailor.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'Righto Cap’n, I mean, Duke, sir.',
      characterId: '32',
      position: 2,
    },
    {
      body: 'Don’t go easy on him because he’s my son. Forge him into a man, Rocco.',
      characterId: '19',
      position: 1,
    },
    {
      body: 'Come along now, swabbie, let’s get to the shipyard.',
      characterId: '32',
      position: 2,
    },
    {
      body: 'Righto, Rocco, but first I’ve got to say good-bye to Lucia and Carlotta.',
      characterId: '1',
      position: 2,
      action: () => {
        recruitRocco();
      },
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  houseAfterQuest: [
    {
      body: 'I’m awfully sorry, but the Duke’s orders were quite specific. You are not to enter the house.',
      characterId: '7',
      position: 1,
      exitBuilding: true,
    },
  ],
  houseAfterQuestAndPub: [
    {
      body: 'Oh $firstName, I just can’t understand why your father must forbid you from coming in the house.',
      characterId: '20',
      position: 1,
    },
    {
      body: 'Please don’t worry, Mother. I promise that I’ll find the secret of Atlantis, and then I’ll be back.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Aye, me lady, all members of the $lastName family have got to go to sea at one time or another.',
      characterId: '32',
      position: 2,
    },
    {
      body: 'Besides, me thinks there’s trouble brewing between the Captain, I mean the Duke, and some other noble.',
      characterId: '32',
      position: 2,
    },
    {
      body: 'I agree. He’s had several arguments with that noble, Martinez.',
      characterId: '20',
      position: 1,
    },
    {
      body: 'That’s the problem. If it weren’t for Martinez, the Duke could search for the secret of Atlantis himself, and $firstName could stay here.',
      characterId: '32',
      position: 2,
    },
    {
      body: 'And that’s why he wants another Captain to take his place.',
      characterId: '32',
      position: 2,
    },
    {
      body: 'Oh, dear Rocco, you’re a lot brighter than you look. It’s like you’re reading the Duke’s mind!',
      characterId: '20',
      position: 1,
    },
    {
      body: 'That’s because I’ve known the Duke since he was kneehigh to a grasshopper!',
      characterId: '32',
      position: 2,
    },
    {
      body: 'And whether foul or fair cause, I’m all for sending the boy out to learn the ways of the world.',
      characterId: '32',
      position: 2,
    },
    {
      body: 'There’s nothing better than a hardy stint at sea to toughen a lad up.',
      characterId: '32',
      position: 2,
    },
    {
      body: 'If that’s the case, then I trust you’ll look out for $firstName, my only son.',
      characterId: '20',
      position: 1,
    },
    {
      body: '$firstName, I heard from Lucia that there’s not too much money for the voyage.',
      characterId: '20',
      position: 1,
    },
    {
      body: 'This was all so sudden, I couldn’t get everything ready, but please take this.',
      characterId: '20',
      position: 1,
      action: () => {
        buyItem('53', true);
      },
    },
    {
      body: 'This is the aquamarine tiara your father gave to me.',
      characterId: '20',
      position: 1,
    },
    {
      body: 'Sell this for however much you can. But don’t tell your father.',
      characterId: '20',
      position: 1,
    },
    {
      body: 'Now $firstName, my only son, please be very careful! May fair weather be with you on your voyage.',
      characterId: '20',
      position: 1,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  houseAfterQuestAndPub2: [
    {
      body: 'I’m awfully sorry, but the Duke’s orders were quite specific. You are not to enter the house.',
      characterId: '7',
      position: 1,
    },

    {
      body: 'I know that. I just thought that I’d say good-bye before I got started on my trip.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Well then, Master $firstName, please be careful. The sea’s a fickle lady. She can change unexpectedly. ',
      characterId: '7',
      position: 1,
      exitBuilding: true,
    },
  ],
  pubBeforeQuest: [
    {
      body: 'Well isn’t this a rare treat, Master $firstName.',
      characterId: '98',
      position: 1,
    },
    {
      body: 'Hey $firstName, how about playing a tune for me on that lute of yours? I feel like singing!',
      characterId: '99',
      position: 1,
    },
    {
      body: 'Lucia! You should be more polite to the son of a noble.',
      characterId: '98',
      position: 1,
    },
    {
      body: 'Oh, don’t worry, Lucia and I have been friends forever!',
      characterId: '1',
      position: 2,
    },
    {
      body: 'By the way, $firstName, Rocco came by here looking for you. He said the Duke was calling for you.',
      characterId: '98',
      position: 1,
    },
    {
      body: 'My father? Well then, I apologize, but I’d better be going.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Oh, $firstName! You’re leaving already?!',
      characterId: '99',
      position: 1,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  pubBeforeQuest2: [
    {
      body: 'Master $firstName, I think you’d better be heading home now.',
      characterId: '98',
      position: 1,
      exitBuilding: true,
    },
  ],
  pubAfterQuest: [
    {
      body: 'Master $firstName, what’s going on? The whole town is in an uproar.',
      characterId: '98',
      position: 1,
    },
    {
      body: 'Are you really going to leave on a sea voyage?',
      characterId: '99',
      position: 1,
    },
    {
      body: 'I’m afraid so. It’s the $lastName tradition, after all.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Except, I’m not sure what we’re going to do about money.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Why not become a traveling band? I’d be happy to sing for you!',
      characterId: '99',
      position: 1,
    },
    {
      body: 'Come now, Lucia, stop your nonsense.',
      characterId: '98',
      position: 1,
    },
    {
      body: 'Master $firstName, here is 1000 gold pieces. Please, take it.',
      characterId: '98',
      position: 1,
    },
    {
      body: 'Here I thought this pub wasn’t popular at all, but ye’ve managed to save up quite a little bit.',
      characterId: '32',
      position: 1,
    },
    {
      body: 'Thanks. Sorry we’re not up to your standards, Rocco.',
      characterId: '98',
      position: 1,
    },
    {
      body: 'Master $firstName, please, accept this gift.',
      characterId: '98',
      position: 1,
    },
    {
      body: 'No, I’m sorry, but I can’t. I wouldn’t be able to return it to you.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Don’t worry about that. Actually, I’m not supposed to say this, but this money is really from your father, the Duke.',
      characterId: '98',
      position: 1,
    },
    {
      body: 'He said, ’Please give this to $firstName if he stops by to see you.’',
      characterId: '98',
      position: 1,
    },
    {
      body: 'My father...?',
      characterId: '1',
      position: 2,
      action: () => {
        receiveGold(1000);
      },
    },
    {
      body: 'This is all well and good, but we’ll be needing a little more money if ye wants to get further than Lisbon...',
      characterId: '32',
      position: 1,
    },
    {
      body: 'Shiver me timbers! Why didn’t I think of this earlier? Ye mother will help ye!',
      characterId: '32',
      position: 1,
    },
    {
      body: 'But how? I’m not even allowed inside the house.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Don’t worry. I’ll take a message for you.',
      characterId: '99',
      position: 2,
    },
    {
      body: 'Lucia!',
      characterId: '1',
      position: 2,
      fadeBeforeNext: true,
    },
    {
      body: 'I’m back.',
      characterId: '99',
      position: 1,
    },
    {
      body: 'So, missie, how’d it go?',
      characterId: '32',
      position: 1,
    },
    {
      body: 'She wants you to come to the house between 10 and 12 at night.',
      characterId: '99',
      position: 1,
    },
    {
      body: 'Thanks for the advice Carlotta. Thank you Lucia.',
      characterId: '1',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  pubAfterQuest2: [
    {
      body: 'I heard that your mother wants you to come to the house between 10 and 12 at night.',
      characterId: '99',
      position: 1,
      exitBuilding: true,
    },
  ],
  lodgeBankGuildBeforeQuestRandom1: [
    {
      body: 'Well this is a surprise, Master $firstName. Are you avoiding something?',
      position: 0,
    },
    {
      body: 'You’re part of the $lastName family, so I guess you’ll be taking a trip soon, right?',
      position: 0,
      action: () => {
        exitBuildingIfNotLodge();
      },
    },
  ],
  lodgeBankGuildBeforeQuestRandom2: [
    {
      body: 'Welcome Master $lastName. You know, your father’s one of my best customers.',
      position: 0,
    },
    {
      body: 'Rocco came here looking for you.',
      position: 0,
      action: () => {
        exitBuildingIfNotLodge();
      },
    },
  ],
  lodgeBankGuildBeforeQuestRandom3: [
    {
      body: 'Just a little advice, Master $firstName- visit the pub whenever you’ve got a problem.',
      position: 0,
    },
    {
      body: 'The pub owner, Carlotta, helped out your father, the Duke, quite a bit when he was your age.',
      position: 0,
      action: () => {
        exitBuildingIfNotLodge();
      },
    },
  ],
  lodgeBankGuildAfterQuestRandom1: [
    {
      body: 'Master $firstName, is it true that everyone’s to treat you as a commoner?',
      position: 0,
    },
    {
      body: 'Yes that’s right. So just treat me like a regular sailor, OK?',
      characterId: '1',
      position: 2,
    },
  ],
  lodgeBankGuildAfterQuestRandom2: [
    {
      body: 'Master $firstName, I’m sure you’ll find the secret of Atlantis.',
      position: 0,
    },
  ],
  lodgeBankGuildAfterQuestRandom3: [
    {
      body: 'Say, Master $firstName, you’re leaving pretty soon, aren’t you?',
      position: 0,
    },
  ],
  palaceBeforeQuest: [
    {
      body: 'Welcome Master $firstName. Duke $lastName was here looking for you.',
      position: 0,
      exitBuilding: true,
    },
  ],
  palaceAfterQuest: [
    {
      body: 'Master $firstName, the Duke has ordered everyone to treat you as a commoner. So, I’m afraid I must ask you not to enter the Palace anymore.',
      position: 0,
      exitBuilding: true,
    },
  ],
  itemShopBeforeQuest: [
    {
      body: 'Hello there Master $firstName. Rocco was here earlier looking for you.',
      position: 0,
      exitBuilding: true,
    },
  ],
  itemShopAfterQuest: [
    {
      body: 'Welcome Master $firstName. I have something for you.',
      position: 0,
    },
    {
      body: 'For me?',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Your Butler Marco came by here and asked me to give this rapier to you if you stopped by.',
      position: 0,
    },
    {
      body: 'It’s already been paid for, so please take it.',
      position: 0,
      action: () => {
        buyItem('4', true);
      },
      completeQuest: true,
    },
    {
      body: 'Be careful out there. And remember, a weapon’s useless if you don’t equip yourself with it.',
      position: 0,
    },
  ],
  itemShopAfterQuest2: [
    {
      body: 'Be careful out there. And remember, a weapon’s useless if you don’t equip yourself with it.',
      position: 0,
    },
  ],
  shipyardBeforeQuest: [
    {
      body: 'Say, there’s a ship being built by Duke $lastName’s orders! I wonder who’s going to use it?',
      position: 0,
    },
    {
      body: 'Rocco, probably.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'That reminds me, Rocco was in here looking for you.',
      position: 0,
      exitBuilding: true,
    },
  ],
  shipyardAfterQuest: [
    {
      body: 'Ahoy there, is our ship finished yet?',
      characterId: '32',
      position: 2,
    },
    {
      body: 'Why if it isn’t Rocco! Aye, mate, she’s all finished.',
      position: 0,
    },
    {
      body: 'I built ’er exactly as Duke Leon ordered. A Latin, just like the one he first sailed on.',
      position: 0,
    },
    {
      body: 'Her name’s the Hermes II. She’s got a triangle sail, easy for landlubbers to control.',
      position: 0,
      action: () => {
        receiveFirstShip();
      },
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  churchBeforeQuest: [
    {
      body: 'Master $firstName, is there anyone in the Duke $lastName’s household that could possibly take a trip?',
      position: 0,
    },
    {
      body: 'I’m afraid not. My father is too busy, and I’ve no experience.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'I’m looking for a reliable man to... Well, never mind.',
      position: 0,
    },
    {
      body: 'Oh, that reminds me, Rocco was here looking for you.',
      position: 0,
    },
    {
      body: 'I see. Well then, I guess I’ll go back to the house.',
      characterId: '1',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  churchBeforeQuest2: [
    {
      body: 'Master $firstName, are you going to go to the house now?',
      position: 0,
      exitBuilding: true,
    },
  ],
  churchAfterQuest: [
    {
      body: 'I’m glad you could make it, Master $firstName.',
      position: 0,
    },
    {
      body: 'I heard you had something on your mind. What is it?',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Well, actually, I have something to ask of you.',
      position: 0,
    },
    {
      body: 'Wait a minute. You’re looking for a sailor, right?',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Yes. And I have heard rumors about you, Master $firstName. About your voyage.',
      position: 0,
    },
    {
      body: 'My colleagues and I have long been fascinated by the riddle of the existence of Atlantis. We admire your endeavor.',
      position: 0,
    },
    {
      body: 'And along with that, I have a favor to ask of you, young Master.',
      position: 0,
    },
    {
      body: 'Enrico, Brother Enrico! Over here please.',
      position: 0,
    },
    {
      body: 'Yes sir!',
      characterId: '33',
      position: 2,
    },
    {
      body: 'Brother Enrico is a Franciscan missionary.',
      position: 0,
    },
    {
      body: 'Master $firstName, we’d like to spread the teachings of the Christian faith in the East.',
      position: 0,
    },
    {
      body: 'I know this may be a great deal to ask, but we want you to take him to the land of Zipangu.',
      position: 0,
    },
    {
      body: 'Did you say Zipangu?! I heard from my father that it’s a beautiful island in the far east, that Marco Polo wrote about, but...',
      characterId: '1',
      position: 2,
    },
    {
      body: 'There’s no way I could do that now. I’ve never even left the land of Iberia!',
      characterId: '1',
      position: 2,
    },
    {
      body: 'But I want to exchange knowledge with them, and teach them my faith.',
      characterId: '33',
      position: 2,
    },
    {
      body: 'The Vatican commissioned me to go there as a missionary.',
      characterId: '33',
      position: 2,
    },
    {
      body: 'Please. Take me to Zipangu.',
      characterId: '33',
      position: 2,
    },
    {
      body: 'Well, since you’re willing to go that far, I guess I can’t refuse. But I really can’t say how many years it will take.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Are ye sure ye want to do this? I mean, a promise like that, well...',
      characterId: '32',
      position: 2,
    },
    {
      body: 'Well, Zipangu is certainly far away, but if we take it day by day, and make progress little by little, we’ll make it.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Aye, ye’ve got a point there.',
      characterId: '32',
      position: 2,
      completeQuest: true,
      action: () => {
        recruitEnrico();
      },
    },
  ],
  // Accept/Donate/Refuse not implemented
  churchAfterEnrico: [
    {
      body: 'Oh Master $firstName. Thank you so much for agreeing to take Brother Enrico.',
      position: 0,
    },
    {
      body: 'I managed to get together some gold for you. Please use it wisely.',
      position: 0,
      action: () => {
        receiveGold(1000);
      },
    },
    {
      body: 'Thank you very much. I promise to put it to good use.',
      characterId: '1',
      position: 2,
      completeQuest: true,
    },
  ],
  churchAfterEnricoAfterGift: [
    {
      body: 'Oh Master $firstName. Thank you so much for agreeing to take Brother Enrico.',
      position: 0,
    },
  ],
  harborBeforeQuest: [
    {
      body: 'Master $firstName, whenever you have a problem, just go on over to the pub.',
      position: 0,
    },
    {
      body: 'The pub owner, Carlotta, helped out the Duke quite a bit when he was your age.',
      position: 0,
      exitBuilding: true, // added as it’ll otherwise confuse new players — there’s nothing you can do at this point
    },
  ],
  harborBeforeShip: [
    {
      body: 'We can’t sail the seas without a ship, now can we? Let’s go to the shipyard.',
      characterId: '32',
      position: 1,
      exitBuilding: true, // added as it’ll otherwise confuse new players — there’s nothing you can do at this point
    },
  ],
  harborBeforeEnrico: [
    {
      body: 'Hey Master $firstName, Father Felippe of the church in Lisbon was looking for you.',
      position: 0,
    },
    {
      body: 'Hmm, I wonder what he wants.',
      characterId: '1',
      position: 2,
      exitBuilding: true,
    },
  ],
  harborAfterEnrico: [
    {
      body: 'We’ll be food for the whales if we don’t get our hands on a bit o’ gold. Why don’t ye go to the pub and ask Carlotta for help?',
      characterId: '32',
      position: 1,
    },
  ],
  harborAfterEnrico2: [
    {
      body: 'We’re running pretty low on gold, mate. Ye should go ask Carlotta at the pub. She helped the Duke out when he was younger.',
      characterId: '32',
      position: 1,
    },
  ],
  harborAfterEnricoBeforeMother: [
    {
      body: 'Cap’n, don’t ye think we could use a little bit more money?',
      characterId: '32',
      position: 1,
    },
  ],
  harborFinal: [
    {
      body: 'So what’s the plan of action?',
      characterId: '32',
      position: 1,
    },
    {
      body: 'Well, I thought we’d just sail around from port to port.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Hah! That’s not a very bright plan.',
      characterId: '32',
      position: 1,
    },
    {
      body: 'Why not?',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Gold. It takes a heap o’ gold to keep a ship like this afloat.',
      characterId: '32',
      position: 1,
    },
    {
      body: 'Water’s free, but ye’d be amazed at how much it costs to feed a crew.',
      characterId: '32',
      position: 1,
    },
    {
      body: 'So are you saying that this money won’t be enough?',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Well, it ought to last us about a month. But resting on that fact won’t get us any more!',
      characterId: '32',
      position: 1,
    },
    {
      body: 'But ye’re on the right track. Sailing around from port to port is a good beginning because...',
      characterId: '32',
      position: 1,
    },
    {
      body: 'Ah! You figure we can trade and make a profit along the way, right?',
      characterId: '33',
      position: 1,
    },
    {
      body: 'Ah, now here’s a mate who’s using his noggin!',
      characterId: '32',
      position: 1,
    },
    {
      body: 'But even if we decide to trade, I don’t know what to buy where and where to sell what.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Well, for example, we should buy goods particular to each port. Like Lisbon’s rock salt.',
      characterId: '33',
      position: 1,
    },
    {
      body: 'Hmmm...',
      characterId: '1',
      position: 2,
    },
    {
      body: 'I’m a missionary, but the subject of economics fascinates me. It’s been a hobby of mine to study the market.',
      characterId: '33',
      position: 1,
    },
    {
      body: 'If we buy rock salt for 40 gold pieces here, we should be able to sell it for at least 60 gold pieces in Seville.',
      characterId: '33',
      position: 1,
    },
    {
      body: 'Captain, Brother Enrico seems to have a head for numbers, so why don’t ye make him the bookkeeper on our ship?',
      characterId: '32',
      position: 1,
      confirm: {
        yes: () => {
          assignFirstRoles();

          questData.harborFinal.push(
            {
              body: 'Not a bad idea. Welcome to the crew, Brother Enrico.',
              characterId: '1',
              position: 2,
            },
            {
              body: 'Oh, and I’d like you to be first mate, Rocco.',
              characterId: '1',
              position: 2,
            },
            {
              body: 'Well, I do have a pretty good idea of prices at the ports I’ve read about.',
              characterId: '33',
              position: 1,
            },
            {
              body: 'If we check our log of goods, I should be able to figure out which port will pay the most for each item.',
              characterId: '33',
              position: 1,
              completeQuest: true,
            },
          );
        },
        no: () => {
          questData.harborFinal.push(
            {
              body: 'No, it’s not right to ask Brother Enrico to do such work.',
              characterId: '1',
              position: 2,
            },
            {
              body: 'Well, actually, I wouldn’t mind it in the least. I’d be glad to help!',
              characterId: '33',
              position: 1,
            },
            {
              body: 'Well then, perhaps I’ll ask you again when we start to trade.',
              characterId: '1',
              position: 2,
              completeQuest: true,
            },
          );
        },
      },
    },
  ],
  marketBeforeQuest: [
    {
      body: 'Welcome Master $lastName. It’s always a pleasure to see the son of my favorite customer, the Duke.',
      position: 0,
    },
    {
      body: 'Rocco was just here looking for you.',
      position: 0,
    },
    {
      body: 'By the way, you can sell our rock salt for a pretty profit in the Mediterranean.',
      position: 0,
    },
    {
      body: 'Furthermore, a trade route between here and Seville, with their porcelain, turns a nice profit as well.',
      position: 0,
      exitBuilding: true,
    },
  ],
  marketAfterQuestBeforeShip: [
    {
      body: 'Master $firstName, my apologies, but you don’t have a ship yet to store any goods.',
      position: 0,
    },
    {
      body: 'Come back once you’ve gotten your ship. Thank you, I’m looking forward to doing business with you soon!',
      position: 0,
      exitBuilding: true,
    },
  ],
  pubCarlottaGreeting: [
    {
      body: 'Hello $firstName, would you like some rum?',
      characterId: '98',
      position: 2,
    },
  ],

  // ── Otto Baynes — London (port 30) opening sequence ──
  ottoPalaceKingMission: [
    {
      body: 'The King is waiting for you. Please proceed at once to the royal hall.',
      position: 0,
    },
    {
      body: 'So you finally decided to grace us with your presence! What has been keeping you so long, may I ask? I don\'t suppose you realize how rude it is to keep the King waiting?',
      position: 0,
    },
    {
      body: 'I\'d love to stay and chat with you, old chap, but I do have a bit of important business to attend to. Perhaps we could talk after my audience with the King?',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Hmph, don\'t trifle me with your arrogance. Your moment here won\'t last long, sailor man, so enjoy it while it lasts.',
      position: 0,
    },
    {
      body: 'Hurry up! Quickly!',
      position: 0,
    },
    {
      body: 'Ah, you made it. I called you here today because there is something I must ask of you.',
      position: 0,
    },
    {
      body: 'Anything, your majesty.',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Very good. I\'d like you to take command of a warship.',
      position: 0,
    },
    {
      body: 'A warship...? Did you say a warship!?',
      characterId: '2',
      position: 2,
    },
    {
      body: 'That\'s correct. As you know, there is a powerful nation that threatens our mighty land of England.',
      position: 0,
    },
    {
      body: 'Would you be referring to Spain?',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Exactly. Using their newfound wealth from the New World, they are trying to conquer all of Europe.',
      position: 0,
    },
    {
      body: 'As the King of England, I cannot sit by idly and allow this to occur. Therefore, we need to make a strong war fleet.',
      position: 0,
    },
    {
      body: 'I would like you to accept a position as Head of the Royal Navy. To that end, I want you to go out to sea and gain experience.',
      position: 0,
    },
    {
      body: 'It would be an honor. I respectfully accept.',
      characterId: '2',
      position: 2,
    },
    {
      body: 'I now present you with weapons and a letter of marque. Don\'t forget to equip yourself with the weapons.',
      position: 0,
      action: () => {
        buyItem('4', true); // Rapier
      },
    },
    {
      body: 'With the letter of marque, all your actions will be sanctioned by the throne. Do not abuse this power!',
      position: 0,
    },
    {
      body: 'As of today, you are working for the King of England. From this day forth, you will be known as a page of King Henry the VIII.',
      position: 0,
    },
    {
      body: 'I respectfully accept your generous offer.',
      characterId: '2',
      position: 2,
    },
    {
      body: 'You\'ll need gold to get prepared — ask for as much as you like. Sir Gilbert will take care of all the arrangements. I\'m counting on you, $firstName.',
      position: 0,
    },
    {
      body: 'You don\'t need to worry about a thing, your majesty.',
      characterId: '2',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  ottoPalaceGilbert: [
    {
      body: 'Your ship, more ship than you deserve I might add, is at the harbor. There is also a sailor waiting to meet you there. Do you have any questions?',
      position: 0,
    },
    {
      body: 'I\'d like you to get my money ready.',
      characterId: '2',
      position: 2,
    },
    {
      body: 'A fellow as smart as you imagine yourself to be... 300 gold pieces ought to be more than adequate.',
      position: 0,
    },
    {
      body: 'What do you want me to do with only 300 gold pieces?! His majesty said that I should take as much as I think I need!',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Stop complaining! This is more than enough! Here, take it, you greedy scoundrel!',
      position: 0,
    },
    {
      body: 'Since his majesty is counting on your ability, I do hope you will get us some good results. Hurry up and go to the shipyard and the dock.',
      position: 0,
      action: () => {
        receiveGold(300);
      },
    },
    {
      body: 'Do try to remember you are representing England! Don\'t embarrass us! Though, (sigh) I suppose that may be too much to hope for!',
      position: 0,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  ottoPubMatthew: [
    {
      body: 'Hello there, what\'ll it be?',
      position: 0,
    },
    {
      body: 'Hello, old chap, I\'d like a glass of whiskey.',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Glad you enjoyed it, $firstName. Now about your tab...',
      position: 0,
    },
    {
      body: 'You know, no matter how much of your whiskey I drink, I never tire of it.',
      characterId: '2',
      position: 2,
    },
    {
      body: 'It\'s an honor to receive such compliments from a customer with such refined taste.',
      position: 0,
    },
    {
      body: 'Ahhh... my friend, flattery will get you many things in life, but unfortunately no gold from me today!',
      position: 0,
    },
    {
      body: 'Oh, it\'s you. The (ha!) Commodore.',
      characterId: '34',
      position: 1,
    },
    {
      body: 'Hmph, I think you\'re confused, pal. Why would I want to work for you?',
      characterId: '34',
      position: 1,
    },
    {
      body: 'Well then, let me help you make up your mind.',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Say, you\'re pretty tough!',
      characterId: '34',
      position: 1,
    },
    {
      body: 'You\'re not too shabby yourself!',
      characterId: '2',
      position: 2,
    },
    {
      body: 'My name\'s Matthew. I guess I should call you Commodore now.',
      characterId: '34',
      position: 1,
    },
    {
      body: 'Since you\'ve accepted that fact, how about working for me?',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Why, sure. I\'ve never met a fellow as gutsy as you. Let\'s sit down and have something to drink.',
      characterId: '34',
      position: 1,
      action: () => {
        recruitMatthew();
      },
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  ottoShipyard: [
    {
      body: 'Aye... Sir $lastName, right? I\'ve been wondering when ye\'d come by.',
      position: 0,
    },
    {
      body: 'This may be forward of me, but what is a ship as nice as this going to be used for?',
      position: 0,
    },
    {
      body: 'If I told you I was going to use it to fight the Spanish, what would you think?',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Ye must be joking! I\'d rather hear that ye\'re going to use it for trade!',
      position: 0,
    },
    {
      body: 'Oh, I\'ve painted the ship\'s name. \'Idiot\' — just as ye requested. But are ye sure ye want to use such a name?',
      position: 0,
      action: () => {
        receiveOttoShip();
      },
    },
    {
      body: 'Blast that Gilbert... Well, we\'ll just see who has the last laugh!',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Your ship will be waiting at the docks.',
      position: 0,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  ottoHarbor: [
    {
      body: 'Commodore! I don\'t mind casting off, but where are we headed?',
      characterId: '34',
      position: 1,
    },
    {
      body: 'Ah, I was just thinking about that myself. Why don\'t we do a little spying on the enemy?',
      characterId: '2',
      position: 2,
    },
    {
      body: 'That\'s a good idea. Alright then, let\'s set a course for Seville. We should head South-Southwest.',
      characterId: '34',
      position: 1,
    },
    {
      body: 'If Seville is where you want to go, leave everything to me.',
      characterId: '34',
      position: 1,
      completeQuest: true,
    },
  ],
  ottoHarborMeetMatthew: [
    {
      body: 'You there — are you Commodore $lastName?',
      characterId: '34',
      position: 1,
    },
    {
      body: 'I am. And you must be Matthew Roy.',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Gilbert said you\'d be along. Didn\'t believe him, frankly — no offense. But here you are with a ship and all.',
      characterId: '34',
      position: 1,
    },
    {
      body: 'So you\'ll serve as my navigator?',
      characterId: '2',
      position: 2,
    },
    {
      body: 'That depends. Buy me a drink and convince me. I\'ll be at the pub.',
      characterId: '34',
      position: 1,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  ottoGenericBeforeKing: [
    {
      body: 'The King has sent for Sir $lastName. You should head to the palace at once.',
      position: 0,
      action: () => {
        exitBuildingIfNotLodge();
      },
    },
  ],

  // ── Catalina Erantzo — Barcelona (port 4) opening sequence ──
  catalinaGenericBeforeNavyHQ: [
    {
      body: 'Señorita Erantzo — Commander Ezequiel has sent word. He requests your presence at Navy headquarters immediately.',
      position: 0,
      action: () => {
        exitBuildingIfNotLodge();
      },
    },
  ],
  catalinaNavyHQ: [
    {
      body: 'Señorita Erantzo. The Commander will see you now.',
      position: 0,
    },
    {
      body: 'Catalina. Sit down. I have grave news.',
      position: 0,
    },
    {
      body: 'What has happened?',
      characterId: '3',
      position: 2,
    },
    {
      body: 'Your brother Michael... and your fiancé Hernan. Their ship was lost at Santo Domingo. There were no survivors.',
      position: 0,
    },
    {
      body: '...',
      characterId: '3',
      position: 2,
    },
    {
      body: 'I am sorry, Catalina. Before you go — Michael left this in my keeping. He wanted you to have it.',
      position: 0,
    },
    {
      body: 'His saber.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'Do not do anything rash. That is an order.',
      position: 0,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  catalinaCafe: [
    {
      body: 'Señorita Erantzo. The usual?',
      position: 0,
    },
    {
      body: 'Nothing. Emilio — you were at headquarters when Ezequiel told me. I saw your face.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'Catalina, I—',
      characterId: '35',
      position: 1,
    },
    {
      body: '...Say, did you hear? They\'re saying it wasn\'t an accident. Duke Franco\'s private fleet was spotted off Santo Domingo that same night.',
      position: 0,
    },
    {
      body: 'The Francos. I went back to Ezequiel. He refused me ships and men. "Just a rumor," he said.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'Ha! A rumor! If it walks like a Franco and burns ships like a Franco—',
      position: 0,
    },
    {
      body: 'You there — keep quiet unless you have something useful to say.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'I have something useful! Don\'t give up. That\'s my something useful. Now go DO something about it.',
      position: 0,
    },
    {
      body: 'Emilio. Come with me to the dock.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'Señorita — I could be court-martialed for this.',
      characterId: '35',
      position: 1,
    },
    {
      body: 'Yes.',
      characterId: '3',
      position: 2,
      action: () => {
        recruitEmilio();
      },
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  catalinaHarbor: [
    {
      body: 'That galleon has been sitting here unmanned for two weeks.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'Señorita, you cannot simply take a ship—',
      characterId: '35',
      position: 1,
    },
    {
      body: 'Help me cast off or get out of my way.',
      characterId: '3',
      position: 2,
      action: () => {
        receiveCatalinaShip();
      },
    },
    {
      body: '...God help me. All hands! Cast off lines — we sail NOW!',
      characterId: '35',
      position: 1,
    },
    {
      body: 'I\'ll call her the Rebel.',
      characterId: '3',
      position: 2,
      completeQuest: true,
    },
  ],

  // ── Ernst von Bohr — Amsterdam (port 34) opening sequence ──
  ernstGenericBeforePalace: [
    {
      body: 'Good day, mijnheer von Bohr. A messenger from Herr Mercator was here not long ago. He requests your presence at the guild hall urgently.',
      position: 0,
      action: () => {
        exitBuildingIfNotLodge();
      },
    },
  ],
  ernstPalaceMercator: [
    {
      body: 'Dr. von Bohr! Herr Mercator has been waiting. Please, this way.',
      position: 0,
    },
    {
      body: 'Ernst! My dear friend, at last! Come, come — I have something extraordinary to show you.',
      characterId: '4',
      position: 1,
    },
    {
      body: 'Gerardus. Your note said it was urgent. I came as soon as I could.',
      characterId: '4',
      position: 2,
    },
    {
      body: 'Urgent? It is the opportunity of a lifetime! I have been working on a new projection — a way to represent the curved surface of the earth on a flat map without distortion.',
      characterId: '4',
      position: 1,
    },
    {
      body: 'I have heard of your projection. The navigators speak highly of it.',
      characterId: '4',
      position: 2,
    },
    {
      body: 'But the projection is only as good as its data, Ernst! I need accurate measurements of every coastline, every island. I need someone to sail out there and bring it back to me.',
      characterId: '4',
      position: 1,
    },
    {
      body: 'You want me to chart the entire world.',
      characterId: '4',
      position: 2,
    },
    {
      body: 'Yes! Every sea, every shore. The East India Company will fund the expedition — they need the charts as much as science does. And I need you, Ernst. No one else has both the cartographic skill and the courage to do this.',
      characterId: '4',
      position: 1,
    },
    {
      body: 'A complete map of the world... That would change everything.',
      characterId: '4',
      position: 2,
    },
    {
      body: 'It will change everything. Here — the Company\'s advance. Take your ship from the yard and be on your way, Ernst. The world will not chart itself.',
      characterId: '4',
      position: 1,
      action: () => {
        receiveGold(5000);
      },
    },
    {
      body: 'I won\'t let you down, Gerardus. I\'ll chart every last island.',
      characterId: '4',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  ernstShipyard: [
    {
      body: 'Dr. von Bohr! Your vessel has been prepared to the Company\'s specifications.',
      position: 0,
    },
    {
      body: 'A Nao. She looks sturdy.',
      characterId: '4',
      position: 2,
    },
    {
      body: 'She\'ll handle anything the open ocean throws at her. Deep holds for supplies and equipment, solid construction for long voyages. She\'s built for exactly this kind of work.',
      position: 0,
    },
    {
      body: 'And her range?',
      characterId: '4',
      position: 2,
    },
    {
      body: 'With full provisions she\'ll last months at sea. She\'s yours, mijnheer. We\'ve christened her Meridian, as you requested.',
      position: 0,
      action: () => {
        receiveErnstShip();
      },
    },
    {
      body: 'Meridian. A fitting name for a ship about to cross every meridian on the globe.',
      characterId: '4',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  ernstHarborHans: [
    {
      body: 'Herr Doktor. Hans Brugman. I served six years on Dutch merchant frigates before I got tired of hauling cloth.',
      characterId: '40',
      position: 1,
    },
    {
      body: 'And what brings a gunner to a cartography expedition?',
      characterId: '4',
      position: 2,
    },
    {
      body: 'Unknown waters mean pirates, sea monsters, hostile navies. You\'ll want someone who can put shot through a hull at four hundred yards.',
      characterId: '40',
      position: 1,
    },
    {
      body: 'I can\'t argue with that logic.',
      characterId: '4',
      position: 2,
    },
    {
      body: 'Besides, I\'ve seen your charts. There are coastlines marked "here be dragons." I want to see what\'s actually there.',
      characterId: '40',
      position: 1,
    },
    {
      body: 'Welcome aboard, Brugman. Try not to shoot anything I\'m still mapping.',
      characterId: '4',
      position: 2,
      action: () => {
        recruitHans();
      },
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  ernstHarbor: [
    {
      body: 'Guns are loaded, powder is dry, and the crew looks ready enough. We going, Herr Doktor?',
      characterId: '40',
      position: 1,
    },
    {
      body: 'We are. The Mediterranean first — well-traveled but still poorly charted along the eastern coasts.',
      characterId: '4',
      position: 2,
    },
    {
      body: 'I\'ll keep an eye out for anything that might want to shoot back.',
      characterId: '40',
      position: 1,
    },
    {
      body: 'Please try to let me finish drawing it before it sinks.',
      characterId: '4',
      position: 2,
    },
    {
      body: 'No promises. Cast off!',
      characterId: '40',
      position: 1,
      completeQuest: true,
    },
  ],

  // ── Pietro Conti — Genoa (port 9) opening sequence ──
  pietroGenericBeforeHarbor: [
    {
      body: 'Signor Conti — please, not now. Your creditors have been asking everywhere. Go settle your affairs at the harbor.',
      position: 0,
      action: () => {
        exitBuildingIfNotLodge();
      },
    },
  ],
  pietroHarborMaster: [
    {
      body: 'Pietro Conti! Don\'t even think about using this dock until those debts are cleared.',
      position: 0,
    },
    {
      body: 'I know, I know. Has anyone been asking for me?',
      characterId: '5',
      position: 2,
    },
    {
      body: 'Your friend Camillo was here earlier. Said he had news — left for the pub.',
      position: 0,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  pietroPub: [
    {
      body: 'Signor Conti! Thought you might show up eventually. The usual?',
      position: 0,
    },
    {
      body: 'Just water, Lorenzo. Camillo — what is this news the harbormaster mentioned?',
      characterId: '5',
      position: 2,
    },
    {
      body: 'Pietro! I have been looking everywhere. Sit down. I have spoken with Duchess Christiana Franco in Lisbon.',
      characterId: '37',
      position: 1,
    },
    {
      body: 'Franco? The Portuguese? What does a Portuguese duchess want with us?',
      characterId: '5',
      position: 2,
    },
    {
      body: 'She knows about our debts. All of them. She has offered to pay everything — in full — if we sail for her.',
      characterId: '37',
      position: 1,
    },
    {
      body: 'And what does she want in return?',
      characterId: '5',
      position: 2,
    },
    {
      body: 'Discovery reports. We explore the world, bring her maps and findings. She rewards us generously. She is... a patron of exploration.',
      characterId: '37',
      position: 1,
    },
    {
      body: 'That sounds too clean. What is the catch?',
      characterId: '5',
      position: 2,
    },
    {
      body: 'I have a ship. A Caravela Latina — she is small but sound. And Pietro... we have no other options.',
      characterId: '37',
      position: 1,
    },
    {
      body: '...Alright. What is the ship\'s name?',
      characterId: '5',
      position: 2,
    },
    {
      body: 'She has none yet.',
      characterId: '37',
      position: 1,
    },
    {
      body: 'Then I\'ll call her Falcon. We sail to Lisbon first — I want to hear this offer from the Duchess herself.',
      characterId: '5',
      position: 2,
      action: () => {
        recruitCamillo();
      },
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  pietroShipyard: [
    {
      body: 'Signor Conti. Camillo told me to expect you. His Caravela Latina is ready.',
      position: 0,
    },
    {
      body: 'She is smaller than I remembered.',
      characterId: '5',
      position: 2,
    },
    {
      body: 'She is light and fast — good for long voyages with a small crew. Camillo kept her well.',
      position: 0,
      action: () => {
        receivePietroShip();
      },
    },
    {
      body: 'Falcon. Let\'s see if the name holds.',
      characterId: '5',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  pietroHarbor: [
    {
      body: 'Provisions are loaded and the crew is as ready as they\'ll ever be, Pietro.',
      characterId: '37',
      position: 1,
    },
    {
      body: 'Good. Set course for Lisbon. We have an appointment with a duchess.',
      characterId: '5',
      position: 2,
    },
    {
      body: 'And if this Duchess Franco turns out to be just another creditor with a fancy title?',
      characterId: '37',
      position: 1,
    },
    {
      body: 'Then we sail past Lisbon and keep going until we find something worth finding.',
      characterId: '5',
      position: 2,
      completeQuest: true,
    },
  ],

  // ── Ali Vezas — Istanbul (port 3) opening sequence ──
  aliGenericBeforeCafe: [
    {
      body: 'Ali! There is a man asking for you everywhere. Check the cafe — I think he went that way.',
      position: 0,
      action: () => {
        exitBuildingIfNotLodge();
      },
    },
  ],
  aliCafe: [
    {
      body: 'Ali Vezas! You finally came. Tea?',
      position: 0,
    },
    {
      body: 'Later, Ladia. Someone has been looking for me?',
      characterId: '6',
      position: 2,
    },
    {
      body: 'I was going to say it was Salim, but — look, this is awkward. Your father\'s ship. They found it in the harbor.',
      position: 0,
    },
    {
      body: 'Found it? What do you mean, found it?',
      characterId: '6',
      position: 2,
    },
    {
      body: 'Wrecked, Ali. Go to the shipyard. Salim is there. He will explain everything.',
      position: 0,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  aliGenericBeforeShipyard: [
    {
      body: 'Ali effendi — your friend Salim is waiting at the shipyard. You should go to him.',
      position: 0,
      action: () => {
        exitBuildingIfNotLodge();
      },
    },
  ],
  aliGenericBeforePalace: [
    {
      body: 'Ali Vezas! A palace messenger was just here asking for you. You must go to the palace at once — the Sultan commands it.',
      position: 0,
      action: () => {
        exitBuildingIfNotLodge();
      },
    },
  ],
  aliPalaceSultan: [
    {
      body: 'Ali Vezas presents himself before His Excellency the Sultan.',
      position: 0,
    },
    {
      body: 'Ali. I have heard of your family. Your father served this empire with great loyalty.',
      position: 0,
    },
    {
      body: 'It is a great honor to be remembered, Your Excellency.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'I need merchants who can extend our reach beyond these borders. The empire grows, and our coffers must grow with it. The Europeans are enriching themselves in foreign lands while we watch.',
      position: 0,
    },
    {
      body: 'You wish me to trade in foreign ports, Your Excellency?',
      characterId: '6',
      position: 2,
    },
    {
      body: 'Yes. Establish trade routes. Bring back silk, spices, gold. Show the world that Ottoman merchants are a force to be reckoned with. Here — gold for traveling capital, and a letter of introduction that will open doors in many ports.',
      position: 0,
      action: () => {
        receiveGold(400);
      },
    },
    {
      body: 'I am honored, Your Excellency. I will not disappoint the empire.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'See that you do not. Now go — the seas wait for no one, and the empire\'s patience least of all.',
      position: 0,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  aliShipyard: [
    {
      body: 'Ali! I have been waiting. I am sorry — I did not know how else to tell you.',
      characterId: '38',
      position: 1,
    },
    {
      body: 'Salim. What happened to the ship?',
      characterId: '6',
      position: 2,
    },
    {
      body: 'She was found wrecked in the harbor. We do not know how. The shipbuilder says she can be repaired — but it will cost one thousand gold.',
      characterId: '38',
      position: 1,
    },
    {
      body: 'One thousand gold. I don\'t have one thousand gold.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'I talked to the builder. He will wait for his money — but we must repay ten thousand when we start trading. I said we would agree.',
      characterId: '38',
      position: 1,
    },
    {
      body: 'You agreed to ten thousand on my behalf?',
      characterId: '6',
      position: 2,
    },
    {
      body: 'I agreed to go into business with you. We need the money first. The harbormaster will lend us a thousand — he owes your father a favor. Banker Radino will lend another thousand. I already spoke to Ladia — she will lend us one thousand too. And your savings: one thousand. That is four thousand total.',
      characterId: '38',
      position: 1,
    },
    {
      body: 'Four thousand gold. We will owe forty thousand.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'Forty thousand gold — and a ship. We go into business, Ali. We trade our way out of this.',
      characterId: '38',
      position: 1,
      action: () => {
        recruitSalim();
        receiveGold(4000);
      },
    },
    {
      body: 'Then we name her well. Savahni. It means friends.',
      characterId: '6',
      position: 2,
      action: () => {
        receiveAliShip();
      },
      completeQuest: true,
      exitBuilding: true,
    },
  ],
  aliHarbor: [
    {
      body: 'Everything is loaded — goods for trading, provisions for a month. We are ready to sail, captain.',
      characterId: '38',
      position: 1,
    },
    {
      body: 'Good. Then we sail.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'Where do we make for first?',
      characterId: '38',
      position: 1,
    },
    {
      body: 'West. Alexandria first, then along the northern shore — Genoa, Marseille, Seville. The goods we carry will fetch good prices in Christian ports.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'And after that?',
      characterId: '38',
      position: 1,
    },
    {
      body: 'After that... the whole world, my friend.',
      characterId: '6',
      position: 2,
      completeQuest: true,
    },
  ],

  // ─── JOÃO MID-GAME QUESTS ───────────────────────────────────────────────────

  joaoPalaceAlberto: [
    {
      body: 'João. Close the doors.',
      position: 0,
    },
    {
      body: 'Your Majesty?',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Prince Alberto is missing. He sailed for North Africa on a diplomatic mission — three weeks ago. No word since.',
      position: 0,
    },
    {
      body: 'Missing. You believe pirates?',
      characterId: '1',
      position: 2,
    },
    {
      body: 'We cannot know. What I know is this: it cannot become a scandal. I need a man I trust. I need you, João.',
      position: 0,
    },
    {
      body: 'Alberto and I grew up together. I will find him, Your Majesty. You have my word.',
      characterId: '1',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  joaoHouseAlberto: [
    {
      body: 'João! Come in — I heard. About Alberto. Oh, my son, be careful.',
      position: 0,
    },
    {
      body: 'I will, Mãe. I have sailed worse waters.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'I know you have. Here — take this. Your grandfather\'s ring. Give it to Alberto when you find him. So he knows you come from us.',
      position: 0,
    },
    {
      body: 'I will put it in his hand myself.',
      characterId: '1',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  joaoAliVisitLisbon: [
    {
      body: 'João Franco. I thought I might find you here.',
      characterId: '6',
      position: 1,
    },
    {
      body: 'Ali Vezas. You are a long way from Istanbul. Sit down.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'I am looking for something. A place. Perhaps a person. Have you heard the name Sapha? A settlement, perhaps — somewhere on the East African coast.',
      characterId: '6',
      position: 1,
    },
    {
      body: 'I cannot say I have. East Africa is vast. What draws you there?',
      characterId: '1',
      position: 2,
    },
    {
      body: 'That is a longer story. I will tell it when I have the ending.',
      characterId: '6',
      position: 1,
    },
    {
      body: 'Then I wish you fair winds and a good ending, my friend.',
      characterId: '1',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  joaoMassawaFinal: [
    {
      body: 'Captain. I have news — and it is not simple.',
      characterId: '33',
      position: 1,
    },
    {
      body: 'Speak it plain, Enrico.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'The trail continues east. Beyond the Red Sea. Whoever took Alberto moved him — toward the Indian Ocean.',
      characterId: '33',
      position: 1,
    },
    {
      body: 'Then Massawa is only the gateway.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'It appears so. Do we press on?',
      characterId: '33',
      position: 1,
    },
    {
      body: 'We press on. Check the provisions. We sail with the tide.',
      characterId: '1',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  // ─── CATALINA MID-GAME QUESTS ────────────────────────────────────────────────

  catalinaReturnNavyHQ: [
    {
      body: 'De Melo. I will not pretend I am glad to see you here.',
      position: 0,
    },
    {
      body: 'Commander Ezequiel. Then say what you have to say quickly.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'The navy has listed you as a pirate. A bounty — twenty thousand gold. Raphael Selran has already taken the contract.',
      position: 0,
    },
    {
      body: 'Selran. I know that name.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'Then know this too: he is good at what he does. I am warning you as a courtesy.',
      position: 0,
    },
    {
      body: 'Tell Selran I am not the prey in this story. I am the hunter.',
      characterId: '3',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  catalinaKahnEncounter: [
    {
      body: 'Capitana. A message came for you. A man named Kahn. He says he has heard of your exploits.',
      characterId: '35',
      position: 1,
    },
    {
      body: 'Kahn. What does a pirate lord want with me?',
      characterId: '3',
      position: 2,
    },
    {
      body: 'He wants to test you. In battle. He says — and I quote — "let us see if the legend is earned."',
      characterId: '35',
      position: 1,
    },
    {
      body: 'A pirate lord sending challenges by messenger. How formal of him.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'Shall I send a reply?',
      characterId: '35',
      position: 1,
    },
    {
      body: 'Tell Kahn I will find him when I am ready. On my terms, not his.',
      characterId: '3',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  catalinaAlexandria: [
    {
      body: 'You look surprised to see me, De Melo.',
      characterId: '2',
      position: 1,
    },
    {
      body: 'Otto Baynes. An English privateer in Alexandria. I am surprised.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'Tracking Spanish shipping. Same as always. Though I suspect your interests and mine overlap more than either of us would like to admit.',
      characterId: '2',
      position: 1,
    },
    {
      body: 'I do not trust you.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'Wise. But consider this — Spanish gold ships leaving Cadiz take a northern arc before turning south. I watched three convoys. I can tell you the timing.',
      characterId: '2',
      position: 1,
    },
    {
      body: 'Why share that?',
      characterId: '3',
      position: 2,
    },
    {
      body: 'Because a Spanish convoy disrupted by a Spanish pirate causes a different kind of scandal than one disrupted by an Englishman.',
      characterId: '2',
      position: 1,
    },
    {
      body: 'Baynes. You are almost interesting.',
      characterId: '3',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  catalinaMassawa: [
    {
      body: 'Franco. I did not expect to meet you here.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'De Melo. Likewise.',
      characterId: '1',
      position: 1,
    },
    {
      body: 'I have heard about your methods. Unconventional, they call it.',
      characterId: '1',
      position: 1,
    },
    {
      body: 'And I have heard you are loyal, honest, and stubborn. So we cancel each other out.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'These are dangerous waters. What are your intentions here?',
      characterId: '1',
      position: 1,
    },
    {
      body: 'Same as yours, probably. My own business. But if our paths run the same direction — a temporary alliance costs nothing.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'Agreed. Temporary. And no piracy while I am watching.',
      characterId: '1',
      position: 1,
    },
    {
      body: 'No promises, Franco.',
      characterId: '3',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  // ─── OTTO MID-GAME QUESTS ────────────────────────────────────────────────────

  ottoSevilleSpyMission: [
    {
      body: 'Otto! Over here. Keep your voice down.',
      characterId: '34',
      position: 1,
    },
    {
      body: 'Matthew. You look terrible. What happened?',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Card game. Spanish officers. I may have... lost rather more than I intended.',
      characterId: '34',
      position: 1,
    },
    {
      body: 'How much.',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Six hundred gold. But Otto — I heard them talking. A secret fleet. Being assembled at Cadiz.',
      characterId: '34',
      position: 1,
    },
    {
      body: 'A fleet. What kind?',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Military. Heavy guns. They are not saying what for, but they were nervous men, and nervous men talk.',
      characterId: '34',
      position: 1,
    },
    {
      body: 'That is worth six hundred. This time. Do not gamble with Spanish officers again.',
      characterId: '2',
      position: 2,
      action: () => {
        receiveGold(-600);
      },
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  ottoNantesIntelligence: [
    {
      body: 'You are the English merchant, yes? Word reaches even Nantes. I have information you may find useful.',
      position: 0,
    },
    {
      body: 'What kind of information, and what is your price?',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Spanish gold ships from Seville — they go northwest first. A wide arc, to avoid your patrol routes. Then south, fast, around Iberia.',
      position: 0,
    },
    {
      body: 'They avoid the obvious lanes. Smart. How reliable is this?',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Three convoys I have watched with my own eyes. My price is five hundred gold.',
      position: 0,
    },
    {
      body: 'Done.',
      characterId: '2',
      position: 2,
      action: () => {
        receiveGold(-500);
      },
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  ottoCatalinaMeeting: [
    {
      body: 'You are Baynes. The English privateer.',
      characterId: '3',
      position: 1,
    },
    {
      body: 'And you are Catalina de Melo. In Genoa. That is unexpected.',
      characterId: '2',
      position: 2,
    },
    {
      body: 'I could say the same of you. English privateers do not usually drink in Italian ports.',
      characterId: '3',
      position: 1,
    },
    {
      body: 'Spanish commercial routes. I track them. Genoa is a useful vantage point.',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Mm. And I suppose it is purely coincidence that Spanish ships disappear near wherever you have been.',
      characterId: '3',
      position: 1,
    },
    {
      body: 'Purely. Shall we drink to that?',
      characterId: '2',
      position: 2,
    },
    {
      body: 'One drink. Then we both pretend we never met.',
      characterId: '3',
      position: 1,
    },
    {
      body: 'To coincidence, then.',
      characterId: '2',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  ottoLondonAdmiral: [
    {
      body: 'Otto Baynes. England names you her finest son this generation. The wealth you have brought home, the intelligence on the Spanish — you have changed the balance at sea.',
      position: 0,
    },
    {
      body: 'Your Majesty honors me beyond my deserving.',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Not beyond. Exactly at your deserving. Kneel.',
      position: 0,
    },
    {
      body: 'Your Majesty.',
      characterId: '2',
      position: 2,
    },
    {
      body: 'Rise, Admiral Baynes. Admiral of the English Fleet. England\'s seas are yours to command.',
      position: 0,
    },
    {
      body: '...Otto. You bloody well did it.',
      characterId: '34',
      position: 1,
    },
    {
      body: 'Matthew. Are you actually sober right now?',
      characterId: '2',
      position: 2,
    },
    {
      body: 'For the occasion. Just the once.',
      characterId: '34',
      position: 1,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  // ─── ERNST MID-GAME QUESTS ───────────────────────────────────────────────────

  ernstWorldMapProgress: [
    {
      body: 'Ernst! Come in, come in. Show me what you have.',
      position: 0,
    },
    {
      body: 'The Mediterranean coast — complete. West Africa from Ceuta to the Cape Verde islands. And coastal surveys of the Canaries.',
      characterId: '4',
      position: 2,
    },
    {
      body: 'Every measurement precisely catalogued. Master Mercator, the margin of error is less than two degrees across the entire survey.',
      characterId: '36',
      position: 1,
    },
    {
      body: 'Extraordinary. This is the most accurate chart of that coastline in existence. But Ernst — the Indian Ocean. No European has mapped it properly. That is your next horizon.',
      position: 0,
    },
    {
      body: 'I had hoped you would say that.',
      characterId: '4',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  ernstHansZipangu: [
    {
      body: 'Von Bohr! By all the stars — Ernst von Bohr, drinking in Nagasaki!',
      position: 0,
    },
    {
      body: 'Hans? Hans Brugman? What are you doing at the edge of the world?',
      characterId: '4',
      position: 2,
    },
    {
      body: 'Looking for the edge. There is a place, Ernst — beyond Japan. The locals call it the island paradise. I call it Zipangu.',
      position: 0,
    },
    {
      body: 'Zipangu is a legend. A traveller\'s tale.',
      characterId: '4',
      position: 2,
    },
    {
      body: 'Ernst. Three separate fishermen — different islands, no contact with each other — described the same place. Same currents. Same stars. That is not legend. That is a coordinate waiting to be found.',
      position: 0,
    },
    {
      body: 'He is writing this down already.',
      characterId: '36',
      position: 1,
    },
    {
      body: 'Of course I am.',
      characterId: '4',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  ernstHansLisbon: [
    {
      body: 'You know, Herr Doktor, I thought I\'d be back in Hamburg by now. Married. Maybe a chandlery.',
      characterId: '40',
      position: 1,
    },
    {
      body: 'And instead you are here, loading cannons in Lisbon.',
      characterId: '4',
      position: 2,
    },
    {
      body: 'Best decision I ever made. No offense to chandleries.',
      characterId: '40',
      position: 1,
    },
    {
      body: 'Why did you leave Hamburg?',
      characterId: '4',
      position: 2,
    },
    {
      body: 'My father wanted me to take over his business. I wanted to see the world. We argued. I left.',
      characterId: '40',
      position: 1,
    },
    {
      body: 'Have you written to him?',
      characterId: '4',
      position: 2,
    },
    {
      body: 'Not yet. But when we\'ve mapped every last coastline... maybe I\'ll have something worth telling him about.',
      characterId: '40',
      position: 1,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  // ─── PIETRO MID-GAME QUESTS ──────────────────────────────────────────────────

  pietroLisbonMeetDuchess: [
    {
      body: 'Signor Conti. I have been expecting you.',
      characterId: '39',
      position: 1,
    },
    {
      body: 'Duchess Christiana. I thank you for the audience.',
      characterId: '5',
      position: 2,
    },
    {
      body: 'Your debts — yours and Signor Camillo\'s — are cleared as of this morning. In return, you will send me detailed reports of every discovery, every foreign land, every route you chart.',
      characterId: '39',
      position: 1,
    },
    {
      body: 'Your Excellency. We accept.',
      characterId: '5',
      position: 2,
    },
    {
      body: 'Pietro. She cleared our debts. Just like that.',
      characterId: '37',
      position: 1,
    },
    {
      body: 'Then we had better make sure our reports are worth reading, Camillo.',
      characterId: '5',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  pietroAfricaElDorado: [
    {
      body: 'Signor! You have the look of a man who appreciates rare things. Look at this.',
      position: 0,
    },
    {
      body: 'A map fragment. Partial. What is the origin?',
      characterId: '5',
      position: 2,
    },
    {
      body: 'My own hand. I have walked — walked, mind you — the northern coast of South America. This marks the approach to El Dorado. The golden city.',
      position: 0,
    },
    {
      body: 'This is nonsense. The man is half mad, Pietro.',
      characterId: '37',
      position: 1,
    },
    {
      body: 'A meal and a bottle of wine. That is my price for the fragment.',
      position: 0,
    },
    {
      body: 'Agreed. Eat well, old man.',
      characterId: '5',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  pietroFortuneTeller: [
    {
      body: 'You seek something beyond the horizon. I see it in your eyes, captain.',
      position: 0,
    },
    {
      body: 'Everyone seeks something beyond the horizon. That is not a prophecy.',
      characterId: '5',
      position: 2,
    },
    {
      body: 'The staff of the sea-god lies where three waters meet. Bring it to the city of red cliffs — and the path to the golden city opens.',
      position: 0,
    },
    {
      body: 'He is writing this down. Do not encourage him.',
      characterId: '37',
      position: 1,
    },
    {
      body: 'I am already done writing it.',
      characterId: '5',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  pietroMassawaStaff: [
    {
      body: 'The bronze staff you carry — where did you find this?',
      position: 0,
    },
    {
      body: 'Off the coast of Aden. Recovered from a wreck. Do you recognize it?',
      characterId: '5',
      position: 2,
    },
    {
      body: 'It is the Staff of Poseidon. Sacred to us. Taken by traders three generations ago. We had given up hope of its return.',
      position: 0,
    },
    {
      body: 'Pietro, this is remarkable.',
      characterId: '37',
      position: 1,
    },
    {
      body: 'We accept it gratefully, captain. And in return — there is a route. The ancient texts speak of a sea path east, through the great ocean, to a land beyond all eastern waters.',
      position: 0,
    },
    {
      body: 'Show me where.',
      characterId: '5',
      position: 2,
      action: () => {
        receiveGold(3000);
      },
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  pietroNagasaki: [
    {
      body: 'Conti. I was wondering if our paths would cross out here.',
      characterId: '4',
      position: 1,
    },
    {
      body: 'Von Bohr. Mapping the Pacific now, are you?',
      characterId: '5',
      position: 2,
    },
    {
      body: 'Trying to. The locals speak of an island paradise beyond the known currents. Some say it is the same El Dorado, approached from the east.',
      characterId: '4',
      position: 1,
    },
    {
      body: 'From the east. Interesting. I received a letter from Ali Vezas — he believes the Staff of Poseidon points to an island route through the Pacific.',
      characterId: '5',
      position: 2,
    },
    {
      body: 'Three independent sources. The same place.',
      characterId: '4',
      position: 1,
    },
    {
      body: 'It is not a legend any longer. It is a destination.',
      characterId: '5',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  pietroCayenne: [
    {
      body: 'You are Conti. Pietro Conti. I have been waiting for a man from Lisbon.',
      position: 0,
    },
    {
      body: 'You know me?',
      characterId: '5',
      position: 2,
    },
    {
      body: 'My name is Raul Franco. Christiana Franco is my cousin. I have lived in South America these past twelve years. And I have been watching for someone she trusts.',
      position: 0,
    },
    {
      body: 'What does this have to do with us?',
      characterId: '37',
      position: 1,
    },
    {
      body: 'The Duchess is not merely a patron of exploration. Her family hid a fortune in South America — her ancestor\'s doing, two generations back. She has been searching for it ever since.',
      position: 0,
    },
    {
      body: 'She never told me that.',
      characterId: '5',
      position: 2,
    },
    {
      body: 'She does not trust easily. But if you carry this back to her — she will.',
      position: 0,
    },
    {
      body: 'Pietro. This changes everything.',
      characterId: '37',
      position: 1,
    },
    {
      body: 'Everything and nothing. We were always going to Lisbon. Now we know why she sent us.',
      characterId: '5',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  pietroLisbonEpilogue: [
    {
      body: 'Signor Conti. You have been gone a long time.',
      characterId: '39',
      position: 1,
    },
    {
      body: 'Your Excellency. I have brought you what you asked for — and considerably more.',
      characterId: '5',
      position: 2,
    },
    {
      body: 'The charts. The Staff. The map fragment. And Raul\'s testimony.',
      characterId: '37',
      position: 1,
    },
    {
      body: 'Raul.',
      characterId: '39',
      position: 1,
    },
    {
      body: 'You are quiet, Your Excellency.',
      characterId: '5',
      position: 2,
    },
    {
      body: 'I am thinking.',
      characterId: '39',
      position: 1,
    },
    {
      body: 'You have done more than I asked, Signor Conti. Far more. Perhaps now we can be honest with each other.',
      characterId: '39',
      position: 1,
    },
    {
      body: 'I was hoping you would say that.',
      characterId: '5',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  // ─── ALI MID-GAME QUESTS ─────────────────────────────────────────────────────

  aliLadiaRepay: [
    {
      body: 'Ali Vezas. Back already. And that look on your face — you are here to pay me back.',
      position: 0,
    },
    {
      body: 'Every coin, Ladia. With interest.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'You actually did it. I am impressed.',
      position: 0,
    },
    {
      body: 'I have been looking for someone. A name — Sapha. Have you heard it?',
      characterId: '6',
      position: 2,
    },
    {
      body: 'Sapha. I have heard it once. A trader from East Africa mentioned the name — a woman, living somewhere on the eastern coast. Basra, perhaps, or further south.',
      position: 0,
    },
    {
      body: 'He is already making notes.',
      characterId: '38',
      position: 1,
    },
    {
      body: 'Thank you, Ladia. Truly.',
      characterId: '6',
      position: 2,
      action: () => {
        receiveGold(-2000);
      },
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  aliIstanbulSultanReturn: [
    {
      body: 'Ali Vezas. The accounts speak well of you. Very well.',
      position: 0,
    },
    {
      body: 'Your Majesty. The profits come from the western ports — they prize eastern goods highly.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'And you have brought back more than gold. News, relationships, knowledge of routes. You are a rare merchant.',
      position: 0,
    },
    {
      body: 'I am merely thorough.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'From this day you are Royal Merchant of the Ottoman Empire. Use that title well. The Indian Ocean trade routes are the next frontier — there is wealth there that would change the Empire.',
      position: 0,
    },
    {
      body: 'Then we sail for the Indian Ocean.',
      characterId: '6',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  aliBasraSapha: [
    {
      body: 'You have been watching me since you came in. Whatever you want to say, say it.',
      position: 0,
    },
    {
      body: 'My name is Ali Vezas. I have been looking for you — for a long time.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'I know who you are. Ladia\'s name opens doors. Even this far from Istanbul.',
      position: 0,
    },
    {
      body: 'Then you know I mean no harm.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'Meaning no harm is not the same as being trustworthy. Come back when you have more than promises to offer, Ali Vezas. Then we talk.',
      position: 0,
    },
    {
      body: 'He does not look discouraged.',
      characterId: '38',
      position: 1,
    },
    {
      body: 'Good. Because I am not.',
      characterId: '6',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  aliVeniceHowell: [
    {
      body: 'You are the Ottoman merchant, yes? Ali Vezas? I was told to find you.',
      position: 0,
    },
    {
      body: 'You found me. What do you need?',
      characterId: '6',
      position: 2,
    },
    {
      body: 'My name is Howell. I owe a debt to a banker named Radino — and Radino will not see me. But he will see you. An Ottoman Royal Merchant is another matter entirely.',
      position: 0,
    },
    {
      body: 'And in return?',
      characterId: '6',
      position: 2,
    },
    {
      body: 'I know the eastern Mediterranean trade routes better than any pilot in Venice. Seasonal winds, preferred anchorages, the hidden tolls the Greeks charge. All of it.',
      position: 0,
    },
    {
      body: 'That is useful.',
      characterId: '38',
      position: 1,
    },
    {
      body: 'Agreed, Howell. Come with me to Radino\'s house.',
      characterId: '6',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  aliVeniceSaphaAccepts: [
    {
      body: 'I came of my own accord. I heard what you have been doing. The title. The routes. The reputation.',
      position: 0,
    },
    {
      body: 'Sapha. You are here.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'She came to Venice herself. By choice.',
      characterId: '38',
      position: 1,
    },
    {
      body: 'I said come back with more than promises. So — what do you offer now?',
      position: 0,
    },
    {
      body: 'A home. Safety. A future you choose yourself. I am not here to tell you where to go — only to make sure you have the means to go there.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'That is a better answer than most men give.',
      position: 0,
    },
    {
      body: 'Then let us begin.',
      characterId: '6',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  aliIstanbulEpilogue: [
    {
      body: 'Ali. Back again. You look different. Lighter.',
      position: 0,
    },
    {
      body: 'Ladia. It is done. Sapha is safe — she has a home, work she chose herself, people she trusts.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'You found her. You actually found her.',
      position: 0,
    },
    {
      body: 'It took longer than it should have.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'Your father looked for her too. For years, before he died. He never stopped believing she was alive.',
      position: 0,
    },
    {
      body: 'I know.',
      characterId: '6',
      position: 2,
    },
    {
      body: 'He would be proud of you, Ali Vezas.',
      position: 0,
    },
    {
      body: 'Captain. To your father.',
      characterId: '38',
      position: 1,
    },
    {
      body: 'To my father.',
      characterId: '6',
      position: 2,
      completeQuest: true,
    },
  ],

  // ─── LATE-GAME FINALES ───────────────────────────────────────────────────────

  joaoFinaleLisbon: [
    {
      body: 'João Franco. We had almost stopped waiting.',
      position: 0,
    },
    {
      body: 'Your Majesty. I have returned.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Captain. I found him. Alberto is alive. He is in Goa — living under the protection of a local lord. He chose to stay.',
      characterId: '33',
      position: 1,
    },
    {
      body: '...He chose to stay.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'He left word for you. "The world is wider than either of us imagined. Do not sail back for me. Sail forward."',
      characterId: '33',
      position: 1,
    },
    {
      body: 'The routes you have charted, the discoveries — they are already reshaping Portugal\'s future. More than any fleet we could have sent. João Franco, kneel.',
      position: 0,
    },
    {
      body: 'Your Majesty.',
      characterId: '1',
      position: 2,
    },
    {
      body: 'Rise. Admiral of the Eastern Routes. Portugal\'s eyes upon the world.',
      position: 0,
    },
    {
      body: 'Do not sail back. Sail forward.',
      characterId: '1',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  catalinaFinaleSelran: [
    {
      body: 'De Melo. You have a great deal of nerve coming back to Seville.',
      position: 0,
    },
    {
      body: 'Selran. I was wondering when you would show yourself.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'Twenty thousand gold and the gratitude of the navy. That is what you are worth to me.',
      position: 0,
    },
    {
      body: 'Capitana. He brought four men.',
      characterId: '35',
      position: 1,
    },
    {
      body: 'Then we have more than enough, Emilio.',
      characterId: '3',
      position: 2,
    },
    {
      body: '...This is not how I expected this to go.',
      position: 0,
    },
    {
      body: 'Nobody expects it to go this way when they face me. Walk out of this tavern, Selran. Tell the navy I am dead. Keep the twenty thousand — find it wherever you like. But you do not come for me again.',
      characterId: '3',
      position: 2,
    },
    {
      body: 'She is not bluffing.',
      characterId: '35',
      position: 1,
    },
    {
      body: '...Agreed. Catalina de Melo never existed.',
      position: 0,
    },
    {
      body: 'Smart man.',
      characterId: '3',
      position: 2,
      completeQuest: true,
      exitBuilding: true,
    },
  ],

  ernstFinaleMercator: [
    {
      body: 'Ernst. Come in, come in. I have been watching the window for three days.',
      position: 0,
    },
    {
      body: 'It is done, Gerardus. Every coast I could reach. Every current I could measure. Every route I could verify twice.',
      characterId: '4',
      position: 2,
    },
    {
      body: 'He has carried it rolled under his arm since Nagasaki.',
      characterId: '40',
      position: 1,
    },
    {
      body: '...',
      position: 0,
    },
    {
      body: 'Gerardus. Are you all right?',
      characterId: '4',
      position: 2,
    },
    {
      body: 'I have waited twenty-two years for this map. Give an old man a moment.',
      position: 0,
    },
    {
      body: 'Take as long as you need.',
      characterId: '4',
      position: 2,
    },
    {
      body: 'This will outlast all of us, Ernst. Every ship that sails after us will use this chart. Every single one of them — and they will never know your name.',
      position: 0,
    },
    {
      body: 'They do not need to.',
      characterId: '4',
      position: 2,
    },
    {
      body: 'No. That is precisely what makes you a cartographer and not a conqueror.',
      position: 0,
    },
    {
      body: 'It was worth every mile, captain.',
      characterId: '40',
      position: 1,
      completeQuest: true,
      exitBuilding: true,
    },
  ],
});

export type QuestId = keyof typeof questData;

export default questData;
