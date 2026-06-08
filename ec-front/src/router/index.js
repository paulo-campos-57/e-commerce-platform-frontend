import { createRouter, createWebHistory } from 'vue-router'
import IndexView from '../views/IndexView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AboutView from '../views/AboutView.vue'
import RegisterView from '@/views/RegisterView.vue'
import { userService } from '@/services/userService'
import { useToast } from 'vue-toastification'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'index',
            component: IndexView
        },
        {
            path: '/home',
            name: 'home',
            component: HomeView,
            meta: { requiresAuth: true }
        },
        {
            path: '/homeAdmin',
            name: 'homeAdmin',
            component: () => import('../views/HomeAdminView.vue'),
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/register',
            name: 'register',
            component: RegisterView
        },
        {
            path: '/about',
            name: 'about',
            component: AboutView
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    // We delay the toast instantiation to make sure the app context is ready
    let toast;
    try {
        toast = useToast();
    } catch (e) {
        console.warn("Toastification não pôde ser inicializado no guard:", e);
    }

    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (to.meta.requiresAuth) {
        if (!token || !userStr) {
            if (toast) toast.error("Você precisa estar logado para acessar esta página.");
            return next({ name: 'login' });
        }

        if (to.meta.requiresAdmin) {
            try {
                const user = JSON.parse(userStr);
                
                // Client-side quick check
                if (user.role !== 'admin') {
                    if (toast) toast.error("Acesso negado: esta página é restrita a administradores.");
                    return next({ name: 'home' });
                }

                // Server-side validation against backend database role
                await userService.checkAdmin();
                
                // If it passes, proceed
                return next();
            } catch (error) {
                console.error("Validação de administrador falhou no backend:", error);
                
                if (toast) toast.error("Sessão inválida ou privilégios de administrador expirados.");
                
                // Clear credentials if the backend returns unauthorized/forbidden
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                
                return next({ name: 'login' });
            }
        }
    }

    next();
});

export default router