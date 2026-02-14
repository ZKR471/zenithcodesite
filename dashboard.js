// Configuration - CHANGE TON_API_BACKEND
const API_URL = 'https://TON_API_BACKEND';

let currentScripts = [];
let currentScript = null;

// Vérifier connexion
function checkAuth() {
    const token = localStorage.getItem('discord_token');
    const user = JSON.parse(localStorage.getItem('discord_user') || '{}');
    
    if (!token || !user.id) {
        window.location.href = 'mes-scripts.html';
        return false;
    }
    
    document.getElementById('user-name').textContent = user.username;
    document.getElementById('user-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    
    return true;
}

// Charger les scripts
async function loadScripts() {
    if (!checkAuth()) return;
    
    document.getElementById('loading').style.display = 'block';
    
    try {
        // Utiliser des données de démo
        currentScripts = getDemoScripts();
        displayScripts(currentScripts);
        updateStats(currentScripts);
    } catch (error) {
        console.error('Erreur:', error);
    }
    
    document.getElementById('loading').style.display = 'none';
}

// Données de démonstration
function getDemoScripts() {
    return [
        {
            id: 1,
            name: 'script_points_system.lua',
            type: 'roblox',
            code: `-- Script de système de points
local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player
    
    local points = Instance.new("IntValue")
    points.Name = "Points"
    points.Value = 0
    points.Parent = leaderstats
end)`,
            created_at: new Date().toISOString(),
            description: 'Système de points avec leaderboard'
        },
        {
            id: 2,
            name: 'esx_taxi_job.lua',
            type: 'fivem',
            code: `-- Job de taxi ESX
ESX = exports["es_extended"]:getSharedObject()

RegisterNetEvent("esx:playerLoaded")
AddEventHandler("esx:playerLoaded", function(xPlayer)
    PlayerData = xPlayer
end)`,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            description: 'Job de taxi avec système de courses'
        },
        {
            id: 3,
            name: 'discord_bot.py',
            type: 'python',
            code: `import discord
from discord.ext import commands

bot = commands.Bot(command_prefix="!")

@bot.event
async def on_ready():
    print(f"Bot connecté: {bot.user}")

bot.run("TOKEN")`,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            description: 'Bot Discord simple en Python'
        }
    ];
}

// Afficher les scripts
function displayScripts(scripts) {
    const container = document.getElementById('scripts-grid');
    const empty = document.getElementById('empty');
    
    if (!scripts || scripts.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    
    container.innerHTML = scripts.map(script => `
        <div class="script-card" data-type="${script.type}">
            <div class="script-header">
                <span class="script-type ${script.type}">${getTypeIcon(script.type)} ${script.type.toUpperCase()}</span>
                <span class="script-date">${formatDate(script.created_at)}</span>
            </div>
            <h3>${script.name}</h3>
            <p>${script.description || 'Aucune description'}</p>
            <div class="script-actions">
                <button onclick="viewScript(${script.id})" class="btn-view">👁️ Voir</button>
                <button onclick="downloadScriptDirect(${script.id})" class="btn-download">💾 Télécharger</button>
                <button onclick="copyScriptDirect(${script.id})" class="btn-copy">📋 Copier</button>
            </div>
        </div>
    `).join('');
}

// Stats
function updateStats(scripts) {
    document.getElementById('total-scripts').textContent = scripts.length;
    
    const today = new Date().toDateString();
    const todayScripts = scripts.filter(s => new Date(s.created_at).toDateString() === today);
    document.getElementById('today-scripts').textContent = todayScripts.length;
}

// Icônes
function getTypeIcon(type) {
    const icons = {
        roblox: '🎮',
        fivem: '🚗',
        python: '🐍',
        unity: '🎯',
        web: '🌐'
    };
    return icons[type] || '📄';
}

// Formater date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "À l'instant";
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`;
    if (diff < 604800000) return `Il y a ${Math.floor(diff / 86400000)} j`;
    
    return date.toLocaleDateString('fr-FR');
}

// Voir script
function viewScript(id) {
    const script = currentScripts.find(s => s.id === id);
    if (!script) return;
    
    currentScript = script;
    document.getElementById('modal-title').textContent = script.name;
    document.getElementById('modal-code').textContent = script.code;
    document.getElementById('modal').style.display = 'block';
}

// Fermer modal
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Copier code
function copyCode() {
    if (!currentScript) return;
    
    navigator.clipboard.writeText(currentScript.code).then(() => {
        alert('✅ Code copié!');
    });
}

// Télécharger
function downloadScript() {
    if (!currentScript) return;
    
    const blob = new Blob([currentScript.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentScript.name;
    a.click();
    URL.revokeObjectURL(url);
}

// Télécharger direct
function downloadScriptDirect(id) {
    const script = currentScripts.find(s => s.id === id);
    if (!script) return;
    
    const blob = new Blob([script.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = script.name;
    a.click();
    URL.revokeObjectURL(url);
}

// Copier direct
function copyScriptDirect(id) {
    const script = currentScripts.find(s => s.id === id);
    if (!script) return;
    
    navigator.clipboard.writeText(script.code).then(() => {
        alert('✅ Code copié!');
    });
}

// Filtrer
function filterScripts() {
    const type = document.getElementById('filter-type').value;
    
    if (type === 'all') {
        displayScripts(currentScripts);
    } else {
        const filtered = currentScripts.filter(s => s.type === type);
        displayScripts(filtered);
    }
}

// Rechercher
function searchScripts() {
    const query = document.getElementById('search').value.toLowerCase();
    
    if (!query) {
        displayScripts(currentScripts);
        return;
    }
    
    const filtered = currentScripts.filter(s => 
        s.name.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query))
    );
    
    displayScripts(filtered);
}

// Déconnexion
function logout() {
    localStorage.removeItem('discord_token');
    localStorage.removeItem('discord_user');
    window.location.href = 'index.html';
}

// Charger au démarrage
window.addEventListener('load', () => {
    // Mode démo - commentez ces lignes si vous avez l'API
    const demoUser = {
        id: '123456789',
        username: 'DemoUser',
        avatar: 'default'
    };
    localStorage.setItem('discord_user', JSON.stringify(demoUser));
    localStorage.setItem('discord_token', 'demo_token');
    
    if (checkAuth()) {
        loadScripts();
    }
});
