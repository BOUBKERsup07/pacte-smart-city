-- Enum des rôles métier NadhafaTech
CREATE TYPE public.app_role AS ENUM ('observateur', 'operateur', 'gestionnaire', 'administrateur');

-- Table profils utilisateurs
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profils visibles par tous les utilisateurs authentifiés"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "L'utilisateur peut modifier son propre profil"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "L'utilisateur peut créer son propre profil"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Table des rôles (séparée pour la sécurité)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fonction sécurisée pour vérifier un rôle (évite la récursion RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Utilisateurs voient leurs propres rôles"
  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Administrateurs voient tous les rôles"
  ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'administrateur'));

CREATE POLICY "Administrateurs peuvent gérer les rôles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'administrateur'))
  WITH CHECK (public.has_role(auth.uid(), 'administrateur'));

-- Trigger pour mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Création automatique du profil + rôle par défaut à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'observateur'::app_role)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();