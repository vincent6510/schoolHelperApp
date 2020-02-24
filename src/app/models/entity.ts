export class Entity {
    constructor(
        public id: number,
        public entity_type: string,
        public code: string,
        public name_1: string,
        public name_2: string,
        public card_no: string,
        public avatar: string,
        public security_pin: string,
        public wallet_balance: number,
    ) { }
}