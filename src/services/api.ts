import axios from 'axios'

const API_BASE_URL = 'https://digital-wallet-backend-0uff.onrender.com'

class ApiService {
  private username: string = ''
  private password: string = ''

  setAuth(username: string, password: string) {
    this.username = username
    this.password = password
  }

  clearAuth() {
    this.username = ''
    this.password = ''
  }

  getUsername() {
    return this.username
  }

  private getAuthHeaders() {
    if (!this.username || !this.password) {
      throw new Error('Authentication required')
    }
    
    const credentials = btoa(`${this.username}:${this.password}`)
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    }
  }

  async register(username: string, password: string) {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      username,
      password
    })
    return response.data
  }

  async getBalance(currency: string = 'INR') {
    const response = await axios.get(`${API_BASE_URL}/bal`, {
      headers: this.getAuthHeaders(),
      params: { currency }
    })
    return response.data
  }

  async fundWallet(amount: number) {
    const response = await axios.post(`${API_BASE_URL}/fund`, 
      { amount },
      { headers: this.getAuthHeaders() }
    )
    return response.data
  }

  async payUser(to: string, amt: number) {
    const response = await axios.post(`${API_BASE_URL}/pay`,
      { to, amt },
      { headers: this.getAuthHeaders() }
    )
    return response.data
  }

  async getStatement() {
    const response = await axios.get(`${API_BASE_URL}/stmt`, {
      headers: this.getAuthHeaders()
    })
    return response.data
  }

  async getProducts() {
    const response = await axios.get(`${API_BASE_URL}/product`)
    return response.data
  }

  async addProduct(name: string, price: number, description: string) {
    const response = await axios.post(`${API_BASE_URL}/product`,
      { name, price, description },
      { headers: this.getAuthHeaders() }
    )
    return response.data
  }

  async buyProduct(product_id: number) {
    const response = await axios.post(`${API_BASE_URL}/buy`,
      { product_id },
      { headers: this.getAuthHeaders() }
    )
    return response.data
  }
}

export const api = new ApiService()