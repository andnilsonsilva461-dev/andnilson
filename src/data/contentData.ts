import { InstagramPost } from '../types';

export const HERO_GALLERY = {
  mainDrink: '/images/tapioca_recheada_1788311286058.jpg',
  matchaHero: '/images/cuscuz_nordestino_1788311301928.jpg',
  latteArt: '/images/bolo_da_roca_1788311315751.jpg',
};

export const FEATURED_FAVORITE = {
  id: 'tapioca-carne-sol-coalho',
  title: 'O verdadeiro sabor da roça em cada detalhe.',
  badge: 'DESTAQUE DA CASA',
  name: 'Tapioca de Carne de Sol com Queijo Coalho',
  subtitle: 'Carne de Sol Artesanal • Queijo Coalho Grelhado • Manteiga de Garrafa',
  description:
    'Nossa clássica tapioca com goma fresquinha e macia, recheada fartamente com carne de sol artesanal desfiada, queijo coalho tostadinho na chapa e um toque de manteiga de garrafa da Bahia. Uma experiência afetiva que traz a roça para perto de você.',
  price: 'R$ 22,00',
  originalPrice: 'R$ 25,00',
  rating: '5.0',
  reviewsCount: '580+ avaliações',
  image: '/images/tapioca_recheada_1788311286058.jpg',
  ifoodLink:
    'https://www.ifood.com.br/delivery/feira-de-santana-ba/sabor-da-roca-sim/f373dcc2-b625-4449-aff0-5cc628e61c9b?utm_medium=share',
};

export const SPACE_IMAGES = {
  mainHero: {
    url: '/images/sabor_roca_video_frame.jpg',
    title: 'Sabor Da Roça no Shopping Avenida',
    caption: 'Aconchego, atendimento carinhoso e o cheirinho de café coado e tapioca quentinha no Shopping Avenida.',
  },
  gallery: [
    {
      url: '/images/cuscuz_nordestino_1788311301928.jpg',
      title: 'Cuscuz Quentinho no Vapor',
      aspect: 'aspect-4/5',
      tag: 'Feito na Hora',
    },
    {
      url: '/images/tapioca_recheada_1788311286058.jpg',
      title: 'Tapiocas Crocantes & Recheadas',
      aspect: 'aspect-1/1',
      tag: 'Goma Fresca',
    },
    {
      url: '/images/bolo_da_roca_1788311315751.jpg',
      title: 'Bolos Caseiros Todo Santo Dia',
      aspect: 'aspect-4/3',
      tag: 'Receita de Família',
    },
  ],
};

export const STORY_DATA = {
  headline: 'O verdadeiro sabor da roça em cada detalhe.',
  quote: 'Nascemos para resgatar a tradição do café quentinho, da tapioca na chapa e do cuscuz fofinho.',
  image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1000&q=85',
  paragraphs: [
    'O Sabor Da Roça nasceu com o propósito de levar as memórias mais afetivas do interior para o Shopping Avenida em Feira de Santana.',
    'Trabalhamos com ingredientes selecionados: goma de tapioca fresca, carne de sol desfiada no capricho, manteiga de garrafa pura, milho selecionado para o cuscuz e grãos de café de alta qualidade passados na hora.',
    'Aqui você encontra um refúgio de sabor e acolhimento para o café da manhã, o almoço leve, o lanche da tarde ou aquele cafezinho acompanhado de um pedaço de bolo quentinho.',
  ],
  stats: [
    { label: 'Tapiocas Feitas na Hora', value: '100% Frescas' },
    { label: 'Localização', value: 'Shopping Avenida' },
    { label: 'Origem Baiana', value: 'Feira de Santana' },
  ],
};

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'post-1',
    image: '/images/tapioca_recheada_1788311286058.jpg',
    caption: '🌿 O verdadeiro sabor da roça em cada detalhe! Nossa tapioca de carne de sol com queijo coalho saindo da chapa. 🥞✨',
    likes: 540,
    comments: 42,
    url: 'https://instagram.com/sabordaroca_avenida',
  },
  {
    id: 'post-2',
    image: '/images/cuscuz_nordestino_1788311301928.jpg',
    caption: 'Cuscuz quentinho com queijo coalho e carne de sol dourada na manteiga de garrafa. Impossível resistir! 🌽🤤',
    likes: 680,
    comments: 59,
    url: 'https://instagram.com/sabordaroca_avenida',
  },
  {
    id: 'post-3',
    image: '/images/bolo_da_roca_1788311315751.jpg',
    caption: 'Bolo de milho cremoso quentinho saindo do forno agora no Shopping Avenida! 🍰💛',
    likes: 495,
    comments: 31,
    url: 'https://instagram.com/sabordaroca_avenida',
  },
  {
    id: 'post-4',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    caption: 'Aquele cafezinho passado na hora que perfuma todo o ambiente. Vem provar! ☕🌿',
    likes: 720,
    comments: 64,
    url: 'https://instagram.com/sabordaroca_avenida',
  },
  {
    id: 'post-5',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    caption: 'Cuscuz com ovos caipiras e café com leite: a combinação perfeita para começar o dia. 🍳💛',
    likes: 580,
    comments: 38,
    url: 'https://instagram.com/sabordaroca_avenida',
  },
  {
    id: 'post-6',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    caption: 'Iced Coffee geladinho e cremoso para refrescar sua tarde no Shopping Avenida! 🧊☕',
    likes: 610,
    comments: 45,
    url: 'https://instagram.com/sabordaroca_avenida',
  },
];


