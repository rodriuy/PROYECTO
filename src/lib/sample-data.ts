import type { Story } from './types';

export const sampleStories: Story[] = [
  {
    story_id: '1',
    title: 'La Receta Secreta de la Abuela',
    photo_url: 'https://picsum.photos/600/400',
    audio_url: '/sample-audio.mp3',
    text_transcript:
      'Recuerdo el olor a tuco que inundaba la casa todos los domingos. La abuela amasaba los ñoquis con una paciencia infinita, y su salsa... esa salsa era un secreto que solo ella conocía. Llevaba horas de cocción lenta, amor y un ingrediente que nunca reveló.',
    family_member_name: 'Abuela María',
    emotional_tag: 'amor',
    nfc_card_id: 'receta1',
    timestamp: new Date('2023-04-10T14:00:00Z').getTime(),
    status: 'published',
  },
  {
    story_id: '2',
    title: 'El Primer Sueldo',
    photo_url: 'https://picsum.photos/600/401',
    text_transcript:
      'Mi primer sueldo lo gané en una barraca de lanas en Artigas. Tenía 16 años. Sentí que era millonario. Con ese dinero le compré un vestido a mi madre y un par de zapatos de fútbol para mí. La cara de mi vieja al ver el regalo... eso no tuvo precio.',
    family_member_name: 'Abuelo Juan',
    emotional_tag: 'esfuerzo',
    nfc_card_id: 'sueldo1',
    timestamp: new Date('2023-05-21T18:30:00Z').getTime(),
    status: 'published',
  },
  {
    story_id: '3',
    title: 'Viaje a Rocha',
    photo_url: 'https://picsum.photos/600/402',
    text_transcript:
      'En el verano del 88, nos subimos todos a la camioneta del tío y enfilamos para Rocha. Fueron días de playa, de pescar corvinas en el Valizas y de noches de fogón bajo las estrellas. Fue la primera vez que vi el mar y sentí esa inmensidad.',
    family_member_name: 'Papá Carlos',
    emotional_tag: 'aventura',
    nfc_card_id: 'rocha88',
    timestamp: new Date('2023-08-15T11:00:00Z').getTime(),
    status: 'published',
  },
  {
    story_id: '4',
    title: 'Canción de Cuna',
    photo_url: 'https://picsum.photos/600/403',
    audio_url: '/sample-audio.mp3',
    text_transcript:
      '“Arrorró mi niño, arrorró mi sol...” me cantaba mamá para dormir. Su voz era suave y cálida, y yo me sentía la persona más protegida del mundo. Aún hoy, si cierro los ojos, puedo escucharla y sentir su mano acariciándome el pelo.',
    family_member_name: 'Mamá Ana',
    emotional_tag: 'nostalgia',
    nfc_card_id: 'cuna1',
    timestamp: new Date('2023-11-01T21:00:00Z').getTime(),
    status: 'published',
  },
  {
    story_id: '5',
    title: 'Historia del Apellido Pereira',
    photo_url: 'https://picsum.photos/600/404',
    text_transcript:
      'Nuestro apellido, Pereira, viene de los primeros colonos portugueses que llegaron a la Banda Oriental. Eran agricultores, gente de trabajo que buscaba un futuro mejor. Se dice que el primer Pereira en Artigas plantó un peral, y de ahí el nombre.',
    family_member_name: 'Tío Roberto',
    emotional_tag: 'esfuerzo',
    nfc_card_id: 'apellido1',
    timestamp: new Date('2024-01-20T09:45:00Z').getTime(),
    status: 'published',
  },
];
