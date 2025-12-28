import { ConversationBuilder } from '@/models';
import { drHartman, drKuiper } from './doctors';
import { alice, bob, charlie, diana, eve } from './patients';

export const [
    drHartmanToAlice,
    drHartmanToBob,
    drHartmanToCharlie,
    drKuiperToDiana,
    drKuiperToEve,
] = [
    new ConversationBuilder()
        .from(drHartman)
        .to(alice)
        .withMessage(
            'HbA1c 6,8 % – gestabiliseerd. Vervolg huidige metforminedosering. Volgende labcontrole over 3 maanden.',
        )
        .sendAt(new Date('2025-12-17T11:00:00Z'))
        .build(),
    new ConversationBuilder()
        .from(drHartman)
        .to(bob)
        .withMessage(
            'Jaarlijkse gezondheidscontrole afgerond. BP 128/82, BMI 26. Leefstijladvies gegeven. Geen vervolgactie nodig tot volgend jaar.',
        )
        .sendAt(new Date('2025-12-18T08:30:00Z'))
        .build(),
    new ConversationBuilder()
        .from(drHartman)
        .to(charlie)
        .withMessage(
            'Glucose 18 mmol/L, ketonen 0,4. Insulineschaal aangepast. Patiënt geïnstrueerd over ziektedagregels. Controle binnen 24 uur.',
        )
        .sendAt(new Date('2025-12-18T14:15:00Z'))
        .build(),
    new ConversationBuilder()
        .from(drKuiper)
        .to(diana)
        .withMessage(
            '28 weken zwangerschapsdiabetes, diet-gestuurd. Nuchtere gluc 5,1 mmol/L, postprandiaal 6,9. Vervolg huidig maaltijdplan. Echo gepland in week 32.',
        )
        .sendAt(new Date('2025-12-16T17:00:00Z'))
        .build(),
    new ConversationBuilder()
        .from(drKuiper)
        .to(eve)
        .withMessage(
            'Preventief consult afgerond. Contraceptie en leefstijl besproken. Herhaal BP en gewicht controle over 6 maanden.',
        )
        .sendAt(new Date('2025-12-18T11:15:00Z'))
        .build(),
];

export const defaultConversations = [
    drHartmanToAlice,
    drHartmanToBob,
    drHartmanToCharlie,
    drKuiperToDiana,
    drKuiperToEve,
];
