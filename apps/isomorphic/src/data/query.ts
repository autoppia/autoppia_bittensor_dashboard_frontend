import { websitesData } from "./websites-data";
import { agentsData } from "./agents-data";

export const getLeaderboardData = () => {
    return agentsData.map(agent => {
        const successRates = getAgentSummaryData(agent.id);
        return {
            name: agent.name,
            href: agent.href,
            imageUrl: agent.imageUrl,
            successRate: successRates?.total as number
        }
    }).sort((a, b) => b.successRate - a.successRate);
}

export const getAgentById = (id: string) => {
    return agentsData.find(agent => agent.id === id);
}

export const getTotalTaskCounts = () => {
    let totalEasy = 0;
    let totalMedium = 0;
    let totalHard = 0;
    for (const website of websitesData) {
        const { totalTasks } = website;
        totalEasy += totalTasks[0];
        totalMedium += totalTasks[1];
        totalHard += totalTasks[2];
    }
    return {
        easy: totalEasy,
        medium: totalMedium,
        hard: totalHard,
        total: totalEasy + totalMedium + totalHard
    }
}

export const getAgentSummaryData = (id: string) => {
    const selectedAgent = getAgentById(id);
    if (!selectedAgent) return null;

    const { successfulTasks } = selectedAgent;
    const totalTasks = getTotalTaskCounts();

    let successfulEasy = 0, successfulMedium = 0, successfulHard = 0;

    for (const website in successfulTasks) {
        successfulEasy += successfulTasks[website][0];
        successfulMedium += successfulTasks[website][1];
        successfulHard += successfulTasks[website][2];
    }
    let successfulTotal = successfulEasy + successfulMedium + successfulHard;

    return {
        easy: parseFloat((100 * successfulEasy / totalTasks.easy).toFixed(1)),
        medium: parseFloat((100 * successfulMedium / totalTasks.medium).toFixed(1)),
        hard: parseFloat((100 * successfulHard / totalTasks.hard).toFixed(1)),
        total: parseFloat((100 * successfulTotal / totalTasks.total).toFixed(1)),
    }
}

export const getAgentDetailsData = (id: string) => {
    const selectedAgent = getAgentById(id);
    if (!selectedAgent) return null;

    const { successfulTasks } = selectedAgent;

    return websitesData.map(website => ({
        website: website.name,
        easy: parseFloat((100 * successfulTasks[website.value][0] / website.totalTasks[0]).toFixed(1)),
        medium: parseFloat((100 * successfulTasks[website.value][1] / website.totalTasks[1]).toFixed(1)),
        hard: parseFloat((100 * successfulTasks[website.value][2] / website.totalTasks[2]).toFixed(1)),
    }))
}

