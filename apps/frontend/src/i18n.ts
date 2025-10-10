import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.search': 'Search',
      'nav.create': 'Create Snippet',
      'nav.profile': 'Profile',
      'nav.admin': 'Admin',
      'nav.logout': 'Logout',
      'nav.login': 'Login',
      'nav.signup': 'Sign Up',

      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.view': 'View',
      'common.close': 'Close',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.sort': 'Sort',
      'common.language': 'Language',
      'common.author': 'Author',
      'common.date': 'Date',
      'common.tags': 'Tags',

      // Home page
      'home.title': 'Welcome to PolyglotCodeHub',
      'home.subtitle': 'Share, discover, and execute code snippets in multiple programming languages',
      'home.getStarted': 'Get Started',
      'home.popularSnippets': 'Popular Snippets',
      'home.recentActivity': 'Recent Activity',

      // Search
      'search.title': 'Search Snippets',
      'search.placeholder': 'Search in title, code, tags...',
      'search.noResults': 'No snippets found matching your search criteria.',
      'search.startSearching': 'Start searching for code snippets...',
      'search.results': 'Found {{count}} snippet(s)',
      'search.filters': 'Filters',
      'search.sortBy': 'Sort By',
      'search.sortOrder': 'Sort Order',
      'search.ascending': 'Ascending',
      'search.descending': 'Descending',
      'search.allLanguages': 'All languages',
      'search.allSnippets': 'All snippets',
      'search.publicOnly': 'Public only',
      'search.privateOnly': 'Private only',
      'search.popularTags': 'Popular Tags',

      // Snippet
      'snippet.title': 'Title',
      'snippet.code': 'Code',
      'snippet.description': 'Description',
      'snippet.tags': 'Tags',
      'snippet.language': 'Language',
      'snippet.visibility': 'Visibility',
      'snippet.public': 'Public',
      'snippet.private': 'Private',
      'snippet.created': 'Created',
      'snippet.updated': 'Updated',
      'snippet.author': 'Author',
      'snippet.copyCode': 'Copy code',
      'snippet.run': 'Run',
      'snippet.running': 'Running...',
      'snippet.comments': 'Comments',
      'snippet.addComment': 'Add a comment...',
      'snippet.postComment': 'Post Comment',
      'snippet.reply': 'Reply',
      'snippet.edit': 'Edit',
      'snippet.delete': 'Delete',
      'snippet.save': 'Save',
      'snippet.cancel': 'Cancel',

      // Profile
      'profile.title': 'Profile',
      'profile.displayName': 'Display Name',
      'profile.bio': 'Bio',
      'profile.email': 'Email',
      'profile.avatar': 'Avatar',
      'profile.uploadAvatar': 'Upload Avatar',
      'profile.changePassword': 'Change Password',
      'profile.currentPassword': 'Current Password',
      'profile.newPassword': 'New Password',
      'profile.confirmPassword': 'Confirm New Password',
      'profile.passwordChanged': 'Password changed successfully!',
      'profile.profileUpdated': 'Profile updated successfully!',

      // Auth
      'auth.login': 'Login',
      'auth.signup': 'Sign Up',
      'auth.username': 'Username',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.resetPassword': 'Reset Password',
      'auth.loginSuccess': 'Logged in successfully!',
      'auth.signupSuccess': 'Account created successfully!',
      'auth.logoutSuccess': 'Logged out successfully',

      // Admin
      'admin.title': 'Admin Panel',
      'admin.users': 'Users',
      'admin.snippets': 'Snippets',
      'admin.executions': 'Executions',
      'admin.analytics': 'Analytics',
      'admin.settings': 'Settings',
      'admin.totalUsers': 'Total Users',
      'admin.totalSnippets': 'Total Snippets',
      'admin.totalExecutions': 'Total Executions',
      'admin.successRate': 'Success Rate',
      'admin.languageDistribution': 'Language Distribution',
      'admin.topContributors': 'Top Contributors',
      'admin.recentActivity': 'Recent Activity',

      // Languages
      'lang.python': 'Python',
      'lang.javascript': 'JavaScript',
      'lang.java': 'Java',
      'lang.cpp': 'C++',
      'lang.go': 'Go',
      'lang.rust': 'Rust',
      'lang.ruby': 'Ruby',
      'lang.php': 'PHP',

      // Errors
      'error.network': 'Network error',
      'error.unauthorized': 'Unauthorized',
      'error.notFound': 'Not found',
      'error.server': 'Server error',
      'error.validation': 'Validation error',
      'error.unknown': 'An unknown error occurred'
    }
  },
  es: {
    translation: {
      // Navigation
      'nav.home': 'Inicio',
      'nav.search': 'Buscar',
      'nav.create': 'Crear Snippet',
      'nav.profile': 'Perfil',
      'nav.admin': 'Admin',
      'nav.logout': 'Cerrar Sesión',
      'nav.login': 'Iniciar Sesión',
      'nav.signup': 'Registrarse',

      // Common
      'common.loading': 'Cargando...',
      'common.error': 'Error',
      'common.success': 'Éxito',
      'common.save': 'Guardar',
      'common.cancel': 'Cancelar',
      'common.delete': 'Eliminar',
      'common.edit': 'Editar',
      'common.view': 'Ver',
      'common.close': 'Cerrar',
      'common.search': 'Buscar',
      'common.filter': 'Filtrar',
      'common.sort': 'Ordenar',
      'common.language': 'Lenguaje',
      'common.author': 'Autor',
      'common.date': 'Fecha',
      'common.tags': 'Etiquetas',

      // Home page
      'home.title': 'Bienvenido a PolyglotCodeHub',
      'home.subtitle': 'Comparte, descubre y ejecuta fragmentos de código en múltiples lenguajes de programación',
      'home.getStarted': 'Comenzar',
      'home.popularSnippets': 'Snippets Populares',
      'home.recentActivity': 'Actividad Reciente',

      // Search
      'search.title': 'Buscar Snippets',
      'search.placeholder': 'Buscar en título, código, etiquetas...',
      'search.noResults': 'No se encontraron snippets que coincidan con tu búsqueda.',
      'search.startSearching': 'Comienza a buscar fragmentos de código...',
      'search.results': 'Encontrado(s) {{count}} snippet(s)',
      'search.filters': 'Filtros',
      'search.sortBy': 'Ordenar Por',
      'search.sortOrder': 'Orden',
      'search.ascending': 'Ascendente',
      'search.descending': 'Descendente',
      'search.allLanguages': 'Todos los lenguajes',
      'search.allSnippets': 'Todos los snippets',
      'search.publicOnly': 'Solo públicos',
      'search.privateOnly': 'Solo privados',
      'search.popularTags': 'Etiquetas Populares',

      // Snippet
      'snippet.title': 'Título',
      'snippet.code': 'Código',
      'snippet.description': 'Descripción',
      'snippet.tags': 'Etiquetas',
      'snippet.language': 'Lenguaje',
      'snippet.visibility': 'Visibilidad',
      'snippet.public': 'Público',
      'snippet.private': 'Privado',
      'snippet.created': 'Creado',
      'snippet.updated': 'Actualizado',
      'snippet.author': 'Autor',
      'snippet.copyCode': 'Copiar código',
      'snippet.run': 'Ejecutar',
      'snippet.running': 'Ejecutando...',
      'snippet.comments': 'Comentarios',
      'snippet.addComment': 'Agregar un comentario...',
      'snippet.postComment': 'Publicar Comentario',
      'snippet.reply': 'Responder',
      'snippet.edit': 'Editar',
      'snippet.delete': 'Eliminar',
      'snippet.save': 'Guardar',
      'snippet.cancel': 'Cancelar',

      // Profile
      'profile.title': 'Perfil',
      'profile.displayName': 'Nombre para Mostrar',
      'profile.bio': 'Biografía',
      'profile.email': 'Correo Electrónico',
      'profile.avatar': 'Avatar',
      'profile.uploadAvatar': 'Subir Avatar',
      'profile.changePassword': 'Cambiar Contraseña',
      'profile.currentPassword': 'Contraseña Actual',
      'profile.newPassword': 'Nueva Contraseña',
      'profile.confirmPassword': 'Confirmar Nueva Contraseña',
      'profile.passwordChanged': '¡Contraseña cambiada exitosamente!',
      'profile.profileUpdated': '¡Perfil actualizado exitosamente!',

      // Auth
      'auth.login': 'Iniciar Sesión',
      'auth.signup': 'Registrarse',
      'auth.username': 'Nombre de Usuario',
      'auth.email': 'Correo Electrónico',
      'auth.password': 'Contraseña',
      'auth.confirmPassword': 'Confirmar Contraseña',
      'auth.forgotPassword': '¿Olvidaste tu contraseña?',
      'auth.resetPassword': 'Restablecer Contraseña',
      'auth.loginSuccess': '¡Sesión iniciada exitosamente!',
      'auth.signupSuccess': '¡Cuenta creada exitosamente!',
      'auth.logoutSuccess': 'Sesión cerrada exitosamente',

      // Admin
      'admin.title': 'Panel de Administración',
      'admin.users': 'Usuarios',
      'admin.snippets': 'Snippets',
      'admin.executions': 'Ejecuciones',
      'admin.analytics': 'Analíticas',
      'admin.settings': 'Configuración',
      'admin.totalUsers': 'Total de Usuarios',
      'admin.totalSnippets': 'Total de Snippets',
      'admin.totalExecutions': 'Total de Ejecuciones',
      'admin.successRate': 'Tasa de Éxito',
      'admin.languageDistribution': 'Distribución de Lenguajes',
      'admin.topContributors': 'Principales Contribuidores',
      'admin.recentActivity': 'Actividad Reciente',

      // Languages
      'lang.python': 'Python',
      'lang.javascript': 'JavaScript',
      'lang.java': 'Java',
      'lang.cpp': 'C++',
      'lang.go': 'Go',
      'lang.rust': 'Rust',
      'lang.ruby': 'Ruby',
      'lang.php': 'PHP',

      // Errors
      'error.network': 'Error de red',
      'error.unauthorized': 'No autorizado',
      'error.notFound': 'No encontrado',
      'error.server': 'Error del servidor',
      'error.validation': 'Error de validación',
      'error.unknown': 'Ocurrió un error desconocido'
    }
  },
  fr: {
    translation: {
      // Navigation
      'nav.home': 'Accueil',
      'nav.search': 'Rechercher',
      'nav.create': 'Créer un Snippet',
      'nav.profile': 'Profil',
      'nav.admin': 'Admin',
      'nav.logout': 'Déconnexion',
      'nav.login': 'Connexion',
      'nav.signup': 'Inscription',

      // Common
      'common.loading': 'Chargement...',
      'common.error': 'Erreur',
      'common.success': 'Succès',
      'common.save': 'Sauvegarder',
      'common.cancel': 'Annuler',
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.view': 'Voir',
      'common.close': 'Fermer',
      'common.search': 'Rechercher',
      'common.filter': 'Filtrer',
      'common.sort': 'Trier',
      'common.language': 'Langage',
      'common.author': 'Auteur',
      'common.date': 'Date',
      'common.tags': 'Étiquettes',

      // Home page
      'home.title': 'Bienvenue sur PolyglotCodeHub',
      'home.subtitle': 'Partagez, découvrez et exécutez des extraits de code dans plusieurs langages de programmation',
      'home.getStarted': 'Commencer',
      'home.popularSnippets': 'Snippets Populaires',
      'home.recentActivity': 'Activité Récente',

      // Search
      'search.title': 'Rechercher des Snippets',
      'search.placeholder': 'Rechercher dans le titre, le code, les étiquettes...',
      'search.noResults': 'Aucun snippet trouvé correspondant à vos critères de recherche.',
      'search.startSearching': 'Commencez à rechercher des extraits de code...',
      'search.results': '{{count}} snippet(s) trouvé(s)',
      'search.filters': 'Filtres',
      'search.sortBy': 'Trier Par',
      'search.sortOrder': 'Ordre',
      'search.ascending': 'Ascendant',
      'search.descending': 'Descendant',
      'search.allLanguages': 'Tous les langages',
      'search.allSnippets': 'Tous les snippets',
      'search.publicOnly': 'Public seulement',
      'search.privateOnly': 'Privé seulement',
      'search.popularTags': 'Étiquettes Populaires',

      // Snippet
      'snippet.title': 'Titre',
      'snippet.code': 'Code',
      'snippet.description': 'Description',
      'snippet.tags': 'Étiquettes',
      'snippet.language': 'Langage',
      'snippet.visibility': 'Visibilité',
      'snippet.public': 'Public',
      'snippet.private': 'Privé',
      'snippet.created': 'Créé',
      'snippet.updated': 'Mis à jour',
      'snippet.author': 'Auteur',
      'snippet.copyCode': 'Copier le code',
      'snippet.run': 'Exécuter',
      'snippet.running': 'Exécution...',
      'snippet.comments': 'Commentaires',
      'snippet.addComment': 'Ajouter un commentaire...',
      'snippet.postComment': 'Publier le Commentaire',
      'snippet.reply': 'Répondre',
      'snippet.edit': 'Modifier',
      'snippet.delete': 'Supprimer',
      'snippet.save': 'Sauvegarder',
      'snippet.cancel': 'Annuler',

      // Profile
      'profile.title': 'Profil',
      'profile.displayName': 'Nom d\'Affichage',
      'profile.bio': 'Biographie',
      'profile.email': 'E-mail',
      'profile.avatar': 'Avatar',
      'profile.uploadAvatar': 'Télécharger un Avatar',
      'profile.changePassword': 'Changer le Mot de Passe',
      'profile.currentPassword': 'Mot de Passe Actuel',
      'profile.newPassword': 'Nouveau Mot de Passe',
      'profile.confirmPassword': 'Confirmer le Nouveau Mot de Passe',
      'profile.passwordChanged': 'Mot de passe changé avec succès !',
      'profile.profileUpdated': 'Profil mis à jour avec succès !',

      // Auth
      'auth.login': 'Connexion',
      'auth.signup': 'Inscription',
      'auth.username': 'Nom d\'Utilisateur',
      'auth.email': 'E-mail',
      'auth.password': 'Mot de Passe',
      'auth.confirmPassword': 'Confirmer le Mot de Passe',
      'auth.forgotPassword': 'Mot de passe oublié ?',
      'auth.resetPassword': 'Réinitialiser le Mot de Passe',
      'auth.loginSuccess': 'Connexion réussie !',
      'auth.signupSuccess': 'Compte créé avec succès !',
      'auth.logoutSuccess': 'Déconnexion réussie',

      // Admin
      'admin.title': 'Panneau d\'Administration',
      'admin.users': 'Utilisateurs',
      'admin.snippets': 'Snippets',
      'admin.executions': 'Exécutions',
      'admin.analytics': 'Analyses',
      'admin.settings': 'Paramètres',
      'admin.totalUsers': 'Total des Utilisateurs',
      'admin.totalSnippets': 'Total des Snippets',
      'admin.totalExecutions': 'Total des Exécutions',
      'admin.successRate': 'Taux de Réussite',
      'admin.languageDistribution': 'Distribution des Langages',
      'admin.topContributors': 'Principaux Contributeurs',
      'admin.recentActivity': 'Activité Récente',

      // Languages
      'lang.python': 'Python',
      'lang.javascript': 'JavaScript',
      'lang.java': 'Java',
      'lang.cpp': 'C++',
      'lang.go': 'Go',
      'lang.rust': 'Rust',
      'lang.ruby': 'Ruby',
      'lang.php': 'PHP',

      // Errors
      'error.network': 'Erreur réseau',
      'error.unauthorized': 'Non autorisé',
      'error.notFound': 'Non trouvé',
      'error.server': 'Erreur serveur',
      'error.validation': 'Erreur de validation',
      'error.unknown': 'Une erreur inconnue s\'est produite'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;