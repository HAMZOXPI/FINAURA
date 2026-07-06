-- Morocco property types and defaults
alter table public.properties drop constraint if exists properties_property_type_check;

update public.properties set property_type = case property_type
  when 'house' then 'maison'
  when 'apartment' then 'appartement'
  when 'condo' then 'appartement'
  when 'townhouse' then 'maison'
  when 'land' then 'terrain'
  else property_type
end;

alter table public.properties add constraint properties_property_type_check
  check (property_type in (
    'appartement', 'villa', 'maison', 'terrain',
    'local_commercial', 'bureau', 'ferme', 'riad'
  ));

alter table public.properties alter column country set default 'Maroc';

update public.properties set country = 'Maroc' where country = 'USA' or country is null;

-- Subscription plan prices in MAD
update public.subscription_plans set
  price_monthly = 0,
  features = array[
    'Parcourir toutes les annonces',
    'Enregistrer jusqu''à 10 favoris',
    'Publier 1 annonce',
    'Contacter les vendeurs',
    'Recherche et filtres de base'
  ]
where slug = 'free';

update public.subscription_plans set
  price_monthly = 299,
  features = array[
    'Tout l''offre Gratuit',
    'Favoris illimités',
    'Jusqu''à 5 annonces',
    'Support prioritaire',
    'Tableau de bord analytique'
  ]
where slug = 'pro';

update public.subscription_plans set
  price_monthly = 999,
  features = array[
    'Tout l''offre Pro',
    'Annonces illimitées',
    'Gestion d''équipe',
    'Accès API',
    'Gestionnaire de compte dédié'
  ]
where slug = 'enterprise';
