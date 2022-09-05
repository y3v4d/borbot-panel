import CH from "../api/clickerheroes";

namespace Clan {
    export enum Class {
        Rogue = 1,
        Mage = 2,
        Priest = 3,
        UNDEFINED = -1
    }

    export interface Member {
        uid: string;
        highestZone: number;
        nickname: string;
        class: Class;
        level: number;
    
        lastRewardTimestamp: string;
        lastBonusRewardTimestamp: string;
    }

    export class Manager {
        private _name: string = "";
        private _masterUid: string = "";
        private _members: Map<string, Member> = new Map();
        private _legacyRaidLevel: number = 0;
        private _newRaidLevel: number = 0;
        private _autoJoin: boolean = false;
        private _newRaidLocked: boolean = false;

        private uid: string;
        private passwordHash: string;

        constructor(uid: string, passwordHash: string) {
            this.uid = uid;
            this.passwordHash = passwordHash;
        }

        async update() {
            const info = await CH.getGuildInfo(this.uid, this.passwordHash);
            if(!info) return false;

            this._name = info.guild.name;
            this._masterUid = info.guild.guildMasterUid;
            this._legacyRaidLevel = info.guild.currentRaidLevel;
            this._newRaidLevel = info.guild.currentNewRaidLevel;
            this._autoJoin = info.guild.autoJoin;
            this._newRaidLocked = info.guild.newRaidLocked == "true";

            this._members.clear();
            Object.values(info.guildMembers).forEach(member => {
                this._members.set(member.uid, {
                    uid: member.uid,
                    highestZone: parseInt(member.highestZone),
                    nickname: member.nickname,
                    class: parseInt(member.chosenClass) as Class,
                    level: parseInt(member.classLevel),

                    lastRewardTimestamp: member.lastRewardTimestamp,
                    lastBonusRewardTimestamp: member.lastBonusRewardTimestamp
                });
            });

            return true;
        }

        getMemberByUid(uid: string) {
            return this._members.get(uid);
        }

        get name() { return this._name; }
        get masterUid() { return this._masterUid; }
        get legacyRaidLevel() { return this._legacyRaidLevel; }
        get newRaidLevel() { return this._newRaidLevel; }
        get autoJoin() { return this._autoJoin; }
        get newRaidLocked() { return this._newRaidLocked; }
    }

    export async function validate(uid: string, passwordHash: string) {
        return (await CH.getGuildInfo(uid, passwordHash)) !== null;
    }

}

export default Clan;